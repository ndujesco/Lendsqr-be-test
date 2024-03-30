import { NextFunction, Request, Response } from 'express';
import { SignUpDto } from '../dto/auth';
import AuthRepository from '../repository/auth';
import logger from '../utils/winston';
import { AuthError, BadRequestError } from '../middleware/error';
import { hashPassword } from '../utils/auth';
import { UserI } from '../utils/interface';
import { KarmaService } from '../service/karma';

export default class AuthController {
  static async signUp({ body }: Request, res: Response, next: NextFunction) {
    const { email, phone, password: unhashedPasswrd } = body as SignUpDto;

    const user = await AuthRepository.hasUser({ email, phone }); // check if a user with the email exists
    if (user) throw new BadRequestError('User already exists!');

    const isBlackListed =
      (await KarmaService.userIsBlacklisted(email)) ||
      (await KarmaService.userIsBlacklisted(phone));
    if (isBlackListed) throw new AuthError('User is blacklisted');

    const password = await hashPassword(unhashedPasswrd);
    const userInfo: UserI = { ...body, password };

    await AuthRepository.createUser(userInfo);

    res.json({ message: 'User created successfully!', success: true });
  }
}
