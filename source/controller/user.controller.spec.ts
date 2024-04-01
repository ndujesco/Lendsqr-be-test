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

process.env = {
  PER_PAGE: '10',
};

const [
  loggedUserId,
  otherUserId,
  balance,
  pageNumber,
  walletNumber,
  // checkoutUrl,
  // remark,
  // amount,
] = [1, 2, '<balance>', null, '<walletNumber>'];

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
    const request = { user: { userId: loggedUserId } } as AuthRequest;

    const getMyProfile = async () =>
      await UserController.getMyProfile(request, response);

    it("returns the looged in user's profile", async () => {
      (UserRepository.findMyProfile as jest.Mock).mockResolvedValueOnce(
        '<foundUser>'
      );

      const data = await getMyProfile();

      expect(UserRepository.findMyProfile).toHaveBeenLastCalledWith(
        loggedUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual('<foundUser>');
    });

    it('throws NotFoundError if user does not exist', async () => {
      (UserRepository.findMyProfile as jest.Mock).mockResolvedValueOnce(false);

      expect(getMyProfile()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getMyBalance', () => {
    const request = { user: { userId: loggedUserId } } as AuthRequest;

    const getMyBalance = async () =>
      await UserController.getMyBalance(request, response);

    it("returns the logged in user's balance", async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValueOnce({
        balance,
      });

      const data = await getMyBalance();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: loggedUserId,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ balance });
    });

    it('throws NotFoundError if user does not exist', async () => {
      (UserRepository.findMyProfile as jest.Mock).mockResolvedValueOnce(false);

      expect(getMyBalance()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTransactionsByType', () => {
    const request = {
      user: { userId: loggedUserId },
      query: { transactionType: TransactionType.TRANSFER },
    } as unknown as AuthRequest;

    const getTransactionsByType = async () =>
      await UserController.getTransactionsByType(request, response);

    it("returns the user's transactions according to the type specified, returns all if none is specified", async () => {
      (
        TransactionRepository.findMyTransactionsByType as jest.Mock
      ).mockResolvedValueOnce('<transactionsByType>');

      (Helper.removeTransactionFields as jest.Mock).mockReturnValueOnce(
        '<removedFields>'
      );
      (Helper.groupByTransactionType as jest.Mock).mockReturnValueOnce(
        '<groupedByType>'
      );

      const data = await getTransactionsByType();

      expect(
        TransactionRepository.findMyTransactionsByType
      ).toHaveBeenLastCalledWith({
        userId: loggedUserId,
        transactionType: TransactionType.TRANSFER,
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
      user: { userId: loggedUserId },
      query: { pageNumber },
    } as unknown as AuthRequest;

    const getTransactions = async () =>
      await UserController.getTransactions(request, response);

    it("returns the user's transactions according to the page specified, returns first page if none is specified", async () => {
      (
        TransactionRepository.findMyTransactionsByPage as jest.Mock
      ).mockResolvedValueOnce('<transactionsByPage>');

      (Helper.removeTransactionFields as jest.Mock).mockReturnValueOnce(
        '<removedFields>'
      );

      const data = await getTransactions();

      expect(
        TransactionRepository.findMyTransactionsByPage
      ).toHaveBeenLastCalledWith({
        userId: loggedUserId,
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
      user: { userId: loggedUserId },
      query: { userId: otherUserId },
    } as unknown as AuthRequest;

    const getCommonTransactions = async () =>
      await UserController.getCommonTransactions(request, response);

    it("returns the logged in user's common transaction with the other specified user", async () => {
      (
        TransactionRepository.findCommonTransactions as jest.Mock
      ).mockResolvedValueOnce('<commonTransactions>');

      const data = await getCommonTransactions();

      expect(
        TransactionRepository.findCommonTransactions
      ).toHaveBeenLastCalledWith(loggedUserId, otherUserId);

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ transactions: '<commonTransactions>' });
    });
  });

  describe('getUserFromWalletNumber', () => {
    const request = { query: { walletNumber } } as unknown as AuthRequest;

    const getUserFromWalletNumber = async () =>
      await UserController.getUserFromWalletNumber(request, response);

    it("returns a user's profile that matches wallet number", async () => {
      (
        UserRepository.findUserByWalletNumber as jest.Mock
      ).mockResolvedValueOnce('<foundUser>');

      const data = await getUserFromWalletNumber();

      expect(UserRepository.findUserByWalletNumber).toHaveBeenLastCalledWith(
        walletNumber
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ user: '<foundUser>' });
    });

    it('throws NotFoundError if wallet number does not exist', async () => {
      (
        UserRepository.findUserByWalletNumber as jest.Mock
      ).mockResolvedValueOnce(false);

      expect(getUserFromWalletNumber()).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserFromId', () => {
    const request = {
      query: { userId: otherUserId },
    } as unknown as AuthRequest;

    const getUserFromId = async () =>
      await UserController.getUserFromId(request, response);

    it("returns a user's profile that matches id", async () => {
      (UserRepository.findProfilesBy as jest.Mock).mockResolvedValueOnce([
        '<foundUser>',
      ]);

      const data = await getUserFromId();

      expect(UserRepository.findProfilesBy).toHaveBeenLastCalledWith(
        'userId',
        otherUserId
      );

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ user: '<foundUser>' });
    });

    it('throws NotFoundError if wallet number does not exist', async () => {
      (UserRepository.findProfilesBy as jest.Mock).mockResolvedValueOnce(false);

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
      (UserRepository.findProfilesBy as jest.Mock).mockResolvedValueOnce(
        '<foundUsers>'
      );

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
