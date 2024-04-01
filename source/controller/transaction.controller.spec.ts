import { Response } from 'express';

import { TransactionController } from './transaction.controller';

import { WalletRepository } from '../repository/wallet.repository';
import { TransactionRepository } from '../repository/transaction.repository';

import { BadRequestError, NotFoundError } from '../middleware/error.middleware';

import { AuthRequest, TransactionType } from '../util/interface.util';
import { PaymentService } from '../service/payment.service';

jest.mock('../database/db', () => ({
  config: jest.fn(),
  db: jest.fn(),
}));

jest.mock('../repository/transaction.repository');
jest.mock('../repository/wallet.repository');

jest.mock('../service/payment.service');

const [
  userId,
  receiverId,
  transactionId,
  checkoutUrl,
  remark,
  amount,
  balance,
] = [
  '<userId>',
  '<receiverId>',
  '<transactionId>',
  '<checkoutUrl>',
  '<remark>',
  10,
  5000, // default balance should be greater than amount
];

describe('TransactionController', () => {
  let response: Response;

  beforeEach(() => {
    response = {
      json: jest.fn((input): void => input.data), // response.json() returns the data
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(TransactionController).toBeDefined();
  });

  describe('transfer', () => {
    const request = {
      body: { receiverId, amount, remark },
      user: { userId },
    } as AuthRequest;

    const transfer = async () =>
      await TransactionController.transfer(request, response);

    it('transfers amount successfully', async () => {
      const wallets = [
        { balance, owner: userId },
        { balance, owner: receiverId },
      ];

      (WalletRepository.findForTransfer as jest.Mock).mockResolvedValue(
        wallets
      );
      (TransactionRepository.transfer as jest.Mock).mockResolvedValue(true);

      const data = await transfer();

      expect(WalletRepository.findForTransfer).toHaveBeenLastCalledWith([
        userId,
        receiverId,
      ]);
      expect(TransactionRepository.transfer).toHaveBeenLastCalledWith({
        wallets,
        transactionInfo: {
          amount,
          remark,
          receiverBalance: balance + amount,
          senderBalance: balance - amount,
          receiver: receiverId,
          sender: userId,
          transactionType: TransactionType.TRANSFER,
          isSuccessful: true,
        },
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toEqual(undefined);
    });

    it('throws NotFoundError if the two separate valid ids is not provided', async () => {
      (WalletRepository.findForTransfer as jest.Mock).mockResolvedValue([
        { balance, owner: userId },
      ]);

      expect(transfer()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if balance is insufficient', async () => {
      (WalletRepository.findForTransfer as jest.Mock).mockResolvedValue([
        { balance: 0, owner: userId },
        { balance, owner: receiverId },
      ]);

      expect(transfer()).rejects.toThrow(BadRequestError);
    });
  });

  describe('topUp', () => {
    const request = {
      body: { amount },
      user: { userId },
    } as AuthRequest;

    const topUp = async () =>
      await TransactionController.topUp(request, response);

    it('initiates the topUp transaction', async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue({ balance });
      (TransactionRepository.create as jest.Mock).mockResolvedValue([
        transactionId,
      ]);
      (PaymentService.initializeTopUp as jest.Mock).mockResolvedValue(
        checkoutUrl
      );

      const data = await topUp();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: userId,
      });
      expect(TransactionRepository.create).toHaveBeenLastCalledWith({
        transactionType: TransactionType.TOP_UP,
        amount,
        receiverBalance: balance, // same as before; hasn't been verified yet
        receiver: userId,
      });
      expect(PaymentService.initializeTopUp).toHaveBeenLastCalledWith({
        amount,
        transactionId,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ paymentId: transactionId, checkoutUrl });
    });

    it('throws NotFoundError if user is not found', async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(topUp()).rejects.toThrow(NotFoundError);
    });
  });

  describe('withdraw', () => {
    const request = {
      body: { amount },
      user: { userId },
    } as AuthRequest;

    const withdraw = async () =>
      await TransactionController.withdraw(request, response);

    it('intitiates the withdrawal transaction', async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue({ balance });
      (TransactionRepository.create as jest.Mock).mockResolvedValue([
        transactionId,
      ]);
      (PaymentService.initializeWithdrawal as jest.Mock).mockResolvedValue(
        checkoutUrl
      );

      const data = await withdraw();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: userId,
      });
      expect(TransactionRepository.create).toHaveBeenLastCalledWith({
        transactionType: TransactionType.WITHDRAWAL,
        amount,
        senderBalance: balance, // same as before; hasn't been verified yet
        sender: userId,
      });
      expect(PaymentService.initializeTopUp).toHaveBeenLastCalledWith({
        amount,
        transactionId,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ paymentId: transactionId, checkoutUrl });
    });

    it('throws NotFoundError if user is not found', async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(withdraw()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if balance is insufficient', async () => {
      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue({
        balance: 0,
      });

      expect(withdraw()).rejects.toThrow(BadRequestError);
    });
  });

  describe('verify', () => {
    const request = {
      body: { paymentId: transactionId },
      user: { userId },
    } as AuthRequest;

    const verify = async () =>
      await TransactionController.verify(request, response);

    it('verifies that the transaction weas successful', async () => {
      const { paymentId } = request.body;
      const wallet = { balance };

      (PaymentService.verifyTransaction as jest.Mock).mockResolvedValue({
        success: true,
        transactionId,
      });
      (TransactionRepository.findOneBy as jest.Mock).mockResolvedValue({
        transactionId,
        isSuccessful: false,
        senderBalance: balance, // same as before; hasn't been verified yet
        amount,
        transactionType: TransactionType.WITHDRAWAL,
      });

      (WalletRepository.findOneBy as jest.Mock).mockResolvedValue(wallet);
      (TransactionRepository.verify as jest.Mock).mockResolvedValue(true);

      const data = await verify();

      expect(PaymentService.verifyTransaction).toHaveBeenLastCalledWith(
        paymentId
      );
      expect(TransactionRepository.findOneBy).toHaveBeenLastCalledWith({
        transactionId,
      });
      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: userId,
      });
      expect(TransactionRepository.verify).toHaveBeenLastCalledWith({
        wallet: { balance: balance - amount }, // will be '+' for topUp
        transaction: {
          transactionId,
          update: { isSuccessful: true, senderBalance: balance - amount }, // will be '+' for topUp
        },
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws BadRequestError if payment id is invalid', async () => {
      (PaymentService.verifyTransaction as jest.Mock).mockResolvedValue({
        success: false,
        transactionId,
      });
      expect(verify()).rejects.toThrow(BadRequestError);
    });

    it('throws NotFoundError if transaction is not found', async () => {
      (PaymentService.verifyTransaction as jest.Mock).mockResolvedValue({
        success: true,
        transactionId,
      });
      (TransactionRepository.findOneBy as jest.Mock).mockResolvedValue(false);

      expect(verify()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if transaction is already verified', async () => {
      (PaymentService.verifyTransaction as jest.Mock).mockResolvedValue({
        success: false,
        transactionId,
      });

      (TransactionRepository.findOneBy as jest.Mock).mockResolvedValue({
        transactionId,
        isSuccessful: true, // transaction is already verified
        senderBalance: balance,
        amount,
        transactionType: TransactionType.WITHDRAWAL,
      });

      expect(verify()).rejects.toThrow(BadRequestError);
    });
  });

  describe('effectWithDrawalStatus', () => {
    it('is a private method that is called by verify, and tested along with it', async () => {});
  });

  describe('effectTopUpStatus', () => {
    it('is a private method that is called by verify, and tested along with it', async () => {});
  });
});
