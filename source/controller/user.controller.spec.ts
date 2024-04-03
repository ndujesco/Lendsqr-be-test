import { Response } from 'express';

import { UserController } from './user.controller';

import { UserRepository } from '../repository/user.repository';

import { NotFoundError } from '../middleware/error.middleware';

import { AuthRequest, TransactionType } from '../util/interface.util';
import { WalletRepository } from '../repository/wallet.repository';
import { TransactionRepository } from '../repository/transaction.repository';
import { Helper } from '../util/helper.util';

jest.mock('../database/db', () => ({
  config: jest.fn(),
  db: jest.fn(),
}));

jest.mock('../repository/user.repository');
jest.mock('../repository/wallet.repository');
jest.mock('../repository/transaction.repository');

jest.mock('../util/helper.util');

const mock = (input: any) => input as jest.Mock;

process.env = {
  PER_PAGE: '10',
};

const [
  loggedUserId,
  otherUserId,
  balance,
  page_number,
  wallet_number,
  // checkoutUrl,
  // remark,
  // amount,
] = [1, 2, '<balance>', null, '<wallet_number>'];

describe('UserController', () => {
  let response: Response;

  beforeEach(() => {
    response = {
      json: jest.fn((input): void => input.data), // response.json() returns the data
    } as unknown as Response;
  });

  it('is defined', () => {
    expect(UserController).toBeDefined();
  });

  describe('getMyProfile', () => {
    const request = { user: { user_id: loggedUserId } } as AuthRequest;

    const getMyProfile = async () =>
      await UserController.getMyProfile(request, response);

    it("returns the looged in user's profile", async () => {
      mock(UserRepository.findMyProfile).mockResolvedValueOnce('<foundUser>');

      const data = await getMyProfile();

      expect(UserRepository.findMyProfile).toHaveBeenLastCalledWith(
        loggedUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<foundUser>');
    });

    it('throws NotFoundError if user does not exist', async () => {
      mock(UserRepository.findMyProfile).mockResolvedValueOnce(false);

      expect(getMyProfile()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getMyBalance', () => {
    const request = { user: { user_id: loggedUserId } } as AuthRequest;

    const getMyBalance = async () =>
      await UserController.getMyBalance(request, response);

    it("returns the logged in user's balance", async () => {
      mock(WalletRepository.findOneBy).mockResolvedValueOnce({ balance });

      const data = await getMyBalance();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: loggedUserId,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ balance });
    });

    it('throws NotFoundError if user does not exist', async () => {
      mock(UserRepository.findMyProfile).mockResolvedValueOnce(false);

      expect(getMyBalance()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTransactionsByType', () => {
    const request = {
      user: { user_id: loggedUserId },
      query: { transaction_type: TransactionType.TRANSFER },
    } as unknown as AuthRequest;

    const getTransactionsByType = async () =>
      await UserController.getTransactionsByType(request, response);

    it("returns the user's transactions according to the type specified, returns all if none is specified", async () => {
      mock(
        TransactionRepository.findMyTransactionsByType
      ).mockResolvedValueOnce('<transactionsByType>');

      mock(Helper.removeTransactionFields).mockReturnValueOnce(
        '<removedFields>'
      );
      mock(Helper.groupByTransactionType).mockReturnValueOnce(
        '<groupedByType>'
      );

      const data = await getTransactionsByType();

      expect(
        TransactionRepository.findMyTransactionsByType
      ).toHaveBeenLastCalledWith({
        user_id: loggedUserId,
        transaction_type: TransactionType.TRANSFER,
      });

      expect(Helper.removeTransactionFields).toHaveBeenLastCalledWith(
        '<transactionsByType>',
        loggedUserId
      );

      expect(Helper.groupByTransactionType).toHaveBeenLastCalledWith(
        '<removedFields>'
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ transactions: '<groupedByType>' });
    });
  });

  describe('getTransactions', () => {
    const request = {
      user: { user_id: loggedUserId },
      query: { page_number },
    } as unknown as AuthRequest;

    const getTransactions = async () =>
      await UserController.getTransactions(request, response);

    it("returns the user's transactions according to the page specified, returns first page if none is specified", async () => {
      mock(
        TransactionRepository.findMyTransactionsByPage
      ).mockResolvedValueOnce('<transactionsByPage>');

      mock(Helper.removeTransactionFields).mockReturnValueOnce(
        '<removedFields>'
      );

      const data = await getTransactions();

      expect(
        TransactionRepository.findMyTransactionsByPage
      ).toHaveBeenLastCalledWith({
        user_id: loggedUserId,
        skip: 0,
        take: Number(process.env.PER_PAGE),
      });

      expect(Helper.removeTransactionFields).toHaveBeenLastCalledWith(
        '<transactionsByPage>',
        loggedUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ transactions: '<removedFields>' });
    });
  });

  describe('getCommonTransactions', () => {
    const request = {
      user: { user_id: loggedUserId },
      query: { user_id: otherUserId },
    } as unknown as AuthRequest;

    const getCommonTransactions = async () =>
      await UserController.getCommonTransactions(request, response);

    it("returns the logged in user's common transaction with the other specified user", async () => {
      mock(TransactionRepository.findCommonTransactions).mockResolvedValueOnce(
        '<commonTransactions>'
      );

      mock(Helper.removeTransactionFields).mockReturnValueOnce(
        '<removedFields>'
      );

      const data = await getCommonTransactions();

      expect(
        TransactionRepository.findCommonTransactions
      ).toHaveBeenLastCalledWith(loggedUserId, otherUserId);

      expect(Helper.removeTransactionFields).toHaveBeenLastCalledWith(
        '<commonTransactions>',
        loggedUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ transactions: '<removedFields>' });
    });
  });

  describe('getUserFromWalletNumber', () => {
    const request = { query: { wallet_number } } as unknown as AuthRequest;

    const getUserFromWalletNumber = async () =>
      await UserController.getUserFromWalletNumber(request, response);

    it("returns a user's profile that matches wallet number", async () => {
      mock(UserRepository.findUserByWalletNumber).mockResolvedValueOnce(
        '<foundUser>'
      );

      const data = await getUserFromWalletNumber();

      expect(UserRepository.findUserByWalletNumber).toHaveBeenLastCalledWith(
        wallet_number
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ user: '<foundUser>' });
    });

    it('throws NotFoundError if wallet number does not exist', async () => {
      mock(UserRepository.findUserByWalletNumber).mockResolvedValueOnce(false);

      expect(getUserFromWalletNumber()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserFromId', () => {
    const request = {
      query: { user_id: otherUserId },
    } as unknown as AuthRequest;

    const getUserFromId = async () =>
      await UserController.getUserFromId(request, response);

    it("returns a user's profile that matches id", async () => {
      mock(UserRepository.findProfilesBy).mockResolvedValueOnce([
        '<foundUser>',
      ]);

      const data = await getUserFromId();

      expect(UserRepository.findProfilesBy).toHaveBeenLastCalledWith(
        'user_id',
        otherUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ user: '<foundUser>' });
    });

    it('throws NotFoundError if user does not exist', async () => {
      mock(UserRepository.findProfilesBy).mockResolvedValueOnce([]);

      expect(getUserFromId()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserBy', () => {
    const request = {
      query: { key: '<key>', value: '<value>' },
    } as unknown as AuthRequest;

    const getUserBy = async () =>
      await UserController.getUserBy(request, response);

    it('returns users that match the key-value pair provided', async () => {
      mock(UserRepository.findProfilesBy).mockResolvedValueOnce('<foundUsers>');

      const data = await getUserBy();

      expect(UserRepository.findProfilesBy).toHaveBeenLastCalledWith(
        '<key>',
        '<value>'
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ users: '<foundUsers>' });
    });
  });
});
