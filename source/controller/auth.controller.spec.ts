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

const mock = (input: any) => input as jest.Mock;

const [
  first_name,
  last_name,
  email,
  password,
  phone,
  otp,
  hashedPassword,
  accessToken,
  user_id,
] = [
  '<first_name>',
  '<last_name>',
  '<email>',
  '<password>',
  '<phone>',
  '<otp>',
  '<hashedPassword>',
  '<accessToken>',
  1,
];

describe('AuthController', () => {
  let response: Response;

  beforeEach(() => {
    mock(Helper.generateRandomOtp).mockClear();

    response = {
      json: jest.fn((input): void => input.data), // response.json() returns the data
    } as unknown as Response;
  });

  it('is defined', () => {
    expect(AuthController).toBeDefined();
  });

  describe('signUp', () => {
    const request = {
      body: {
        first_name,
        last_name,
        email,
        password,
        phone,
      },
    } as Request;

    const signUp = async () => await AuthController.signUp(request, response);

    it('creates a user their wallet in the database if successful', async () => {
      const { body } = request;
      const { email, phone, password, first_name } = body;
      mock(UserRepository.checkEmailOrPhone).mockResolvedValue(false);
      mock(KarmaService.userIsBlacklisted).mockResolvedValue(false);
      mock(Helper.generateRandomOtp).mockReturnValue(otp);
      mock(hashPassword).mockResolvedValue(hashedPassword);

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
        name: first_name,
      });
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws a BadRequest Error is user already exists', async () => {
      mock(UserRepository.checkEmailOrPhone).mockResolvedValue(true);

      expect(signUp()).rejects.toThrow(BadRequestError);
    });

    it('throws AuthError if user is blacklisted', async () => {
      mock(UserRepository.checkEmailOrPhone).mockResolvedValue(false);
      mock(KarmaService.userIsBlacklisted).mockResolvedValue(true);

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
      };

      mock(UserRepository.findOneBy).mockResolvedValue(findOneByResult);

      mock(Helper.isValidOtp).mockReturnValue(true);
      mock(createJWT).mockReturnValue(accessToken);

      mock(Helper.omitUserInfo).mockReturnValue('<omitUserInfoResult>');

      const data = await verifyEmail();

      expect(UserRepository.findOneBy).toHaveBeenLastCalledWith({ email });
      expect(Helper.isValidOtp).toHaveBeenLastCalledWith({
        inputOtp: otp,
        generatedOtp: otp,
      });

      expect(UserRepository.updateOne).toHaveBeenLastCalledWith({
        where: { email },
        update: { is_verified: true },
      });
      expect(Helper.omitUserInfo).toHaveBeenLastCalledWith({
        ...findOneByResult,
        accessToken,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<omitUserInfoResult>');
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue(false);

      expect(verifyEmail()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if otp is invalid', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue(true);
      mock(Helper.isValidOtp).mockReturnValue(false);

      expect(verifyEmail()).rejects.toThrow(AuthError);
    });
  });

  describe('updateEmail', () => {
    const request = { body: { email, user_id } } as Request;

    const updateEmail = async () =>
      await AuthController.updateEmail(request, response);

    it("updates the user's email", async () => {
      const { body } = request;
      const { email } = body;

      mock(UserRepository.checkEmailOrId).mockResolvedValue([
        { user_id, first_name, otp, email },
      ]);
      mock(Helper.generateRandomOtp).mockReturnValue(otp);
      mock(Helper.omitUserInfo).mockReturnValue('<omitUserInfoResult>');

      const data = await updateEmail();

      expect(EmailService.sendOtp).toHaveBeenLastCalledWith({
        to: email,
        otp,
        name: first_name,
      });

      expect(UserRepository.checkEmailOrId).toHaveBeenLastCalledWith(body);
      expect(Helper.generateRandomOtp).toHaveBeenCalledTimes(1);

      expect(UserRepository.updateOne).toHaveBeenLastCalledWith({
        where: { user_id },
        update: { is_verified: false, email, otp },
      });
      expect(EmailService.sendOtp).toHaveBeenLastCalledWith({
        to: email,
        otp,
        name: first_name,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<omitUserInfoResult>');
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(UserRepository.checkEmailOrId).mockResolvedValue([
        { user_id: '<notUserId>', first_name, otp, email },
      ]);

      expect(updateEmail()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if email is in use by another user', async () => {
      mock(UserRepository.checkEmailOrId).mockResolvedValue([
        { user_id: '<notUserId>', first_name, otp, email },
        { user_id, first_name, otp, email },
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
        is_verified: true,
      };

      mock(UserRepository.findOneBy).mockResolvedValue(findOneByResult);
      mock(comparePassword).mockResolvedValue(true);
      mock(createJWT).mockReturnValue(accessToken);
      mock(Helper.omitUserInfo).mockReturnValue('<omitUserInfoResult>');

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
        is_verified: false,
      };
      mock(UserRepository.findOneBy).mockResolvedValue(findOneByResult);

      await signIn();

      expect(Helper.omitUserInfo).toHaveBeenCalledWith({
        ...findOneByResult,
        accessToken: undefined,
      });
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue(false);

      expect(signIn()).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if password is invalid', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue({
        password: '<wrongPassword>',
      });
      mock(comparePassword).mockResolvedValue(false);

      expect(signIn()).rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyPassword', () => {
    const request = { body: { password }, user: { user_id } } as AuthRequest;

    const verifyPassword = async () =>
      await AuthController.verifyPassword(request, response);

    it("verifies the user's password", async () => {
      mock(UserRepository.findOneBy).mockResolvedValue({ password });
      mock(comparePassword).mockResolvedValue(true);

      const data = await verifyPassword();

      expect(UserRepository.findOneBy).toHaveBeenLastCalledWith({ user_id });
      expect(comparePassword).toHaveBeenLastCalledWith(password, password);

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue(false);

      expect(verifyPassword()).rejects.toThrow(NotFoundError);
    });

    it('throws AuthError if password is invalid', async () => {
      mock(UserRepository.findOneBy).mockResolvedValue(true);
      mock(comparePassword).mockResolvedValue(false);

      expect(verifyPassword()).rejects.toThrow(AuthError);
    });
  });
});
