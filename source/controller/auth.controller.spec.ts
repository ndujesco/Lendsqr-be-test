import { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { UserRepository } from '../repository/user.repository';

import { KarmaService } from '../service/karma.service';
import { EmailService } from '../service/email.service';

import {
  AuthError,
  BadRequestError,
  NotFoundError,
} from '../middleware/error.middleware';

import { comparePassword, createJWT, hashPassword } from '../util/auth.util';
import { Helper } from '../util/helper.util';
import { AuthRequest } from '../util/interface.util';

jest.mock('../database/db', () => ({
  config: jest.fn(),
  db: jest.fn(),
}));

jest.mock('../repository/user.repository');

jest.mock('../service/karma.service');
jest.mock('../service/email.service');

jest.mock('../util/auth.util');
jest.mock('../util/helper.util');

const [
  firstName,
  lastName,
  email,
  password,
  phone,
  otp,
  hashedPassword,
  lastUpdated,
  accessToken,
  userId,
] = [
  '<firstName>',
  '<lastName>',
  '<email>',
  '<password>',
  '<phone>',
  '<otp>',
  '<hashedPassword>',
  '<lastUpdated>',
  '<accessToken>',
  '<userId>',
];

describe('AuthController', () => {
  let response: Response;

  beforeEach(() => {
    (Helper.generateRandomOtp as jest.Mock).mockClear();

    response = {
      json: jest.fn((input): void => input.data), // response.json() returns the data
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(AuthController).toBeDefined();
  });

  describe('signUp', () => {
    const request = {
      body: {
        firstName,
        lastName,
        email,
        password,
        phone,
      },
    } as Request;

    const signUp = async () => await AuthController.signUp(request, response);

    it('creates a user their wallet in the database if successful', async () => {
      const { body } = request;
      const { email, phone, password, firstName } = body;
      (UserRepository.checkEmailOrPhone as jest.Mock).mockResolvedValue(false);
      (KarmaService.userIsBlacklisted as jest.Mock).mockResolvedValue(false);
      (Helper.generateRandomOtp as jest.Mock).mockReturnValue(otp);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      const data = await signUp();

      expect(UserRepository.checkEmailOrPhone).toHaveBeenLastCalledWith({
        email,
        phone,
      });
      expect(KarmaService.userIsBlacklisted).toHaveBeenCalledWith(email);
      expect(KarmaService.userIsBlacklisted).toHaveBeenCalledWith(phone);
      expect(KarmaService.userIsBlacklisted).toHaveBeenCalledTimes(2);
      expect(Helper.generateRandomOtp).toHaveBeenCalledTimes(1);

      expect(hashPassword).toHaveBeenLastCalledWith(password);

      expect(UserRepository.signUp).toHaveBeenLastCalledWith({
        ...body,
        password: hashedPassword,
        otp,
      });
      expect(EmailService.sendOtp).toHaveBeenLastCalledWith({
        to: email,
        otp,
        name: firstName,
      });
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws a BadRequest Error is user already exists', async () => {
      (UserRepository.checkEmailOrPhone as jest.Mock).mockResolvedValue(true);

      expect(signUp()).rejects.toThrow(BadRequestError);
    });

    it('throws AuthError if user is blacklisted', async () => {
      (UserRepository.checkEmailOrPhone as jest.Mock).mockResolvedValue(false);
      (KarmaService.userIsBlacklisted as jest.Mock).mockResolvedValue(true);

      expect(signUp()).rejects.toThrow(AuthError);
    });
  });

  describe('verifyEmail', () => {
    const request = { query: { email, otp } } as unknown as Request;

    const verifyEmail = async () =>
      await AuthController.verifyEmail(request, response);

    it("verifies the user's email", async () => {
      const findOneByResult = {
        otp,
        updatedAt: lastUpdated,
      };

      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(
        findOneByResult
      );

      (Helper.isValidOtp as jest.Mock).mockReturnValue(true);
      (createJWT as jest.Mock).mockReturnValue(accessToken);

      (Helper.omitUserInfo as jest.Mock).mockReturnValue(
        '<omitUserInfoResult>'
      );

      const data = await verifyEmail();

      expect(UserRepository.findOneBy).toHaveBeenLastCalledWith({ email });
      expect(Helper.isValidOtp).toHaveBeenLastCalledWith({
        inputOtp: otp,
        generatedOtp: otp,
        lastUpdated,
      });

      expect(UserRepository.updateOne).toHaveBeenLastCalledWith({
        where: { email },
        update: { isVerified: true },
      });
      expect(Helper.omitUserInfo).toHaveBeenLastCalledWith({
        ...findOneByResult,
        accessToken,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<omitUserInfoResult>');
    });

    it('throws NotFoundError if user is not found', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(verifyEmail()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if otp is invalid', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(true);
      (Helper.isValidOtp as jest.Mock).mockReturnValue(false);

      expect(verifyEmail()).rejects.toThrow(AuthError);
    });
  });

  describe('updateEmail', () => {
    const request = { body: { email, userId } } as Request;

    const updateEmail = async () =>
      await AuthController.updateEmail(request, response);

    it("updates the user's email", async () => {
      const { body } = request;
      const { email } = body;

      (UserRepository.checkEmailOrId as jest.Mock).mockResolvedValue([
        { userId, firstName, otp, email },
      ]);
      (Helper.generateRandomOtp as jest.Mock).mockReturnValue(otp);
      (Helper.omitUserInfo as jest.Mock).mockReturnValue(
        '<omitUserInfoResult>'
      );

      const data = await updateEmail();

      expect(EmailService.sendOtp).toHaveBeenLastCalledWith({
        to: email,
        otp,
        name: firstName,
      });

      expect(UserRepository.checkEmailOrId).toHaveBeenLastCalledWith(body);
      expect(Helper.generateRandomOtp).toHaveBeenCalledTimes(1);

      expect(UserRepository.updateOne).toHaveBeenLastCalledWith({
        where: { userId },
        update: { isVerified: false, email, otp },
      });
      expect(EmailService.sendOtp).toHaveBeenLastCalledWith({
        to: email,
        otp,
        name: firstName,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<omitUserInfoResult>');
    });

    it('throws NotFoundError if user is not found', async () => {
      (UserRepository.checkEmailOrId as jest.Mock).mockResolvedValue([
        { userId: '<notUserId>', firstName, otp, email },
      ]);

      expect(updateEmail()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if email is in use by another user', async () => {
      (UserRepository.checkEmailOrId as jest.Mock).mockResolvedValue([
        { userId: '<notUserId>', firstName, otp, email },
        { userId, firstName, otp, email },
      ]);

      expect(updateEmail()).rejects.toThrow(AuthError);
    });
  });

  describe('signIn', () => {
    const request = { body: { email, password } } as Request;

    const signIn = async () => await AuthController.signIn(request, response);

    it('signs in the user and returns an accessToken if they are verified', async () => {
      const findOneByResult = {
        password,
        isVerified: true,
      };

      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(
        findOneByResult
      );
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (createJWT as jest.Mock).mockReturnValue(accessToken);
      (Helper.omitUserInfo as jest.Mock).mockReturnValue(
        '<omitUserInfoResult>'
      );

      const data = await signIn();

      expect(UserRepository.findOneBy).toHaveBeenLastCalledWith({ email });
      expect(comparePassword).toHaveBeenLastCalledWith(password, password);

      expect(Helper.omitUserInfo).toHaveBeenLastCalledWith({
        ...findOneByResult,
        accessToken,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<omitUserInfoResult>');
    });

    it('does not return accessToken if they are not found', async () => {
      const findOneByResult = {
        password,
        isVerified: false,
      };
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(
        findOneByResult
      );

      await signIn();

      expect(Helper.omitUserInfo).toHaveBeenCalledWith({
        ...findOneByResult,
        accessToken: undefined,
      });
    });

    it('throws NotFoundError if user is not found', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(signIn()).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if password is invalid', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue({
        password: '<wrongPassword>',
      });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      expect(signIn()).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyPassword', () => {
    const request = { body: { password }, user: { userId } } as AuthRequest;

    const verifyPassword = async () =>
      await AuthController.verifyPassword(request, response);

    it("verifies the user's password", async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue({ password });
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const data = await verifyPassword();

      expect(UserRepository.findOneBy).toHaveBeenLastCalledWith({ userId });
      expect(comparePassword).toHaveBeenLastCalledWith(password, password);

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws NotFoundError if user is not found', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(verifyPassword()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if password is invalid', async () => {
      (UserRepository.findOneBy as jest.Mock).mockResolvedValue(true);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      expect(verifyPassword()).rejects.toThrow(AuthError);
    });
  });
});
