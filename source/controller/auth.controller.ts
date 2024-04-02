import { Request, Response } from 'express';

import { UserRepository } from '../repository/user.repository';

import { KarmaService } from '../service/karma.service';
import { EmailService } from '../service/email.service';

import {
  AuthError,
  BadRequestError,
  NotFoundError,
} from '../middleware/error.middleware';

import { comparePassword, createJWT, hashPassword } from '../util/auth.util';
import { AuthRequest, UserI } from '../util/interface.util';
import { Helper } from '../util/helper.util';

import {
  SignInDto,
  SignUpDto,
  UpdateEmailDto,
  VerifyEmailDto,
} from '../dto/auth.dto';

export class AuthController {
  static async signUp({ body }: Request, res: Response) {
    const {
      email,
      phone,
      password: unhashedPassword,
      first_name,
    } = body as SignUpDto;

    const user = await UserRepository.checkEmailOrPhone({ email, phone }); // check if a user with the email exists
    if (user) {
      throw new BadRequestError('User already exists!');
    }

    const isBlackListed =
      (await KarmaService.userIsBlacklisted(email)) ||
      (await KarmaService.userIsBlacklisted(phone));
    if (isBlackListed) throw new AuthError('User is blacklisted');

    const otp = Helper.generateRandomOtp();
    const password = await hashPassword(unhashedPassword);
    const userInfo: UserI = { ...body, password, otp };

    /**
     * We need to make sure that is is impossible, even in principle, for there to be a user without a concomitant wallet.
     * We can do this by leveraging the transaction feature.
     */
    await UserRepository.signUp(userInfo); // this creates a user and wallet
    EmailService.sendOtp({ to: email, otp, name: first_name });

    return res.json({
      message: 'User created successfully! An otp has been sent to the mail',
      success: true,
    });
  }

  static async verifyEmail({ query }: Request, res: Response) {
    const { email, otp } = query as unknown as VerifyEmailDto;

    const user = await UserRepository.findOneBy({ email });
    if (!user) throw new NotFoundError('User not found!');

    const isValidOtp = await Helper.isValidOtp({
      inputOtp: otp,
      generatedOtp: user.otp,
    });

    if (!isValidOtp) throw new AuthError('Invalid otp');

    await UserRepository.updateOne({
      where: { email },
      update: { is_verified: true },
    });

    const accessToken = createJWT(user);

    user.is_verified = true; // for the response
    const data = Helper.omitUserInfo({ ...user, accessToken });

    return res.json({
      message: 'Email verified!',
      success: true,
      data,
    }); //the essence od the return is to assist with testing
  }

  static async updateEmail({ body }: Request, res: Response) {
    const { email, user_id } = body as UpdateEmailDto;
    const possibleUsers = await UserRepository.checkEmailOrId(body);

    const foundUser = possibleUsers.find((user) => user.user_id === user_id);
    if (!foundUser) throw new NotFoundError('User not found!');

    /**
     * Make sure the chosen phone number does not already exist.
     * Even if it does, it should be this user that owns it.
     * i.e, they can 'change' their phone number to the same thing
     *
     * PossibleUsers can't be more than 2, at this point but we should cover all cases
     * So instead of possibleUsers.length === 2, we use possibleUsers.length > 1, if perchance more than one user has the email.
     */
    if (possibleUsers.length > 1)
      throw new AuthError('The email is already in use');

    const otp = Helper.generateRandomOtp();
    const update = { email, otp, is_verified: false };

    await UserRepository.updateOne({
      where: { user_id },
      update,
    });
    await EmailService.sendOtp({ to: email, otp, name: foundUser.first_name });

    foundUser.email = email; // for the response
    foundUser.otp = otp; // for the response

    const data = Helper.omitUserInfo({ ...foundUser, email });

    return res.json({
      message: 'Email updated successfully! An otp has been sent to the mail',
      success: true,
      data,
    });
  }

  static async signIn({ body }: Request, res: Response) {
    let accessToken;
    const { email, password } = body as SignInDto;

    const user = await UserRepository.findOneBy({ email });
    if (!user) throw new NotFoundError('Invalid email or password.');

    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) throw new NotFoundError('Invalid email or password.');

    if (user.is_verified) {
      accessToken = createJWT(user);
    }

    const data = Helper.omitUserInfo({ ...user, accessToken });

    return res.json({
      message: 'Sign in successful!',
      success: true,
      data,
    });
  }

  static async verifyPassword({ body, user }: AuthRequest, res: Response) {
    const { password } = body;
    const { user_id } = user;

    const foundUser = await UserRepository.findOneBy({ user_id });
    if (!foundUser) throw new NotFoundError('Invalid user.');

    const passwordMatches = await comparePassword(password, foundUser.password);
    if (!passwordMatches) throw new AuthError('Invalid password.');

    return res.json({
      message: 'Correct password.',
      success: true,
    });
  }
}
