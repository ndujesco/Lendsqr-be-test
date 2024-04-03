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

const mock = (input: any) => input as jest.Mock;

const [
  user_id,
  receiver_id,
  transaction_id,
  checkoutUrl,
  remark,
  amount,
  balance,
] = [
  1,
  2,
  '<transaction_id>',
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

  it('is defined', () => {
    expect(TransactionController).toBeDefined();
  });

  describe('transfer', () => {
    const request = {
      body: { receiver_id, amount, remark },
      user: { user_id },
    } as AuthRequest;

    const transfer = async () =>
      await TransactionController.transfer(request, response);

    it('transfers amount successfully', async () => {
      const wallets = [
        { balance, owner: user_id },
        { balance, owner: receiver_id },
      ];

      mock(WalletRepository.findForTransfer).mockResolvedValue(wallets);
      mock(TransactionRepository.transfer).mockResolvedValue(true);

      const data = await transfer();

      expect(WalletRepository.findForTransfer).toHaveBeenLastCalledWith([
        user_id,
        receiver_id,
      ]);
      expect(TransactionRepository.transfer).toHaveBeenLastCalledWith({
        wallets,
        transactionInfo: {
          amount,
          remark,
          receiver_balance: balance + amount,
          sender_balance: balance - amount,
          receiver: receiver_id,
          sender: user_id,
          transaction_type: TransactionType.TRANSFER,
          is_successful: true,
        },
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toEqual(undefined);
    });

    it('throws NotFoundError if the two separate valid ids is not provided', async () => {
      mock(WalletRepository.findForTransfer).mockResolvedValue([
        { balance, owner: user_id },
      ]);

      expect(transfer()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if balance is insufficient', async () => {
      mock(WalletRepository.findForTransfer).mockResolvedValue([
        { balance: 0, owner: user_id },
        { balance, owner: receiver_id },
      ]);

      expect(transfer()).rejects.toThrow(BadRequestError);
    });
  });

  describe('topup', () => {
    const request = {
      body: { amount },
      user: { user_id },
    } as AuthRequest;

    const topup = async () =>
      await TransactionController.topup(request, response);

    it('initiates the topup transaction', async () => {
      mock(WalletRepository.findOneBy).mockResolvedValue({ balance });
      mock(TransactionRepository.create).mockResolvedValue([transaction_id]);
      mock(PaymentService.initializeTopUp).mockResolvedValue(checkoutUrl);

      const data = await topup();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: user_id,
      });
      expect(TransactionRepository.create).toHaveBeenLastCalledWith({
        transaction_type: TransactionType.TOP_UP,
        amount,
        receiver_balance: balance, // same as before; hasn't been verified yet
        receiver: user_id,
      });
      expect(PaymentService.initializeTopUp).toHaveBeenLastCalledWith({
        amount,
        transaction_id,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ payment_id: transaction_id, checkoutUrl });
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(WalletRepository.findOneBy).mockResolvedValue(false);

      expect(topup()).rejects.toThrow(NotFoundError);
    });
  });

  describe('withdraw', () => {
    const request = {
      body: { amount },
      user: { user_id },
    } as AuthRequest;

    const withdraw = async () =>
      await TransactionController.withdraw(request, response);

    it('intitiates the withdrawal transaction', async () => {
      mock(WalletRepository.findOneBy).mockResolvedValue({ balance });
      mock(TransactionRepository.create).mockResolvedValue([transaction_id]);
      mock(PaymentService.initializeWithdrawal).mockResolvedValue(checkoutUrl);

      const data = await withdraw();

      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: user_id,
      });
      expect(TransactionRepository.create).toHaveBeenLastCalledWith({
        transaction_type: TransactionType.WITHDRAWAL,
        amount,
        sender_balance: balance, // same as before; hasn't been verified yet
        sender: user_id,
      });
      expect(PaymentService.initializeTopUp).toHaveBeenLastCalledWith({
        amount,
        transaction_id,
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual({ payment_id: transaction_id, checkoutUrl });
    });

    it('throws NotFoundError if user is not found', async () => {
      mock(WalletRepository.findOneBy).mockResolvedValue(false);

      expect(withdraw()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if balance is insufficient', async () => {
      mock(WalletRepository.findOneBy).mockResolvedValue({ balance: 0 });

      expect(withdraw()).rejects.toThrow(BadRequestError);
    });
  });

  describe('verify', () => {
    const request = {
      body: { payment_id: transaction_id },
      user: { user_id },
    } as AuthRequest;

    const verify = async () =>
      await TransactionController.verify(request, response);

    it('verifies that the transaction was successful', async () => {
      const { payment_id } = request.body;
      const wallet = { balance };

      mock(PaymentService.verifyTransaction).mockResolvedValue({
        success: true,
        transaction_id,
      });
      mock(TransactionRepository.findOneBy).mockResolvedValue({
        transaction_id,
        is_successful: false,
        sender_balance: balance, // same as before; hasn't been verified yet
        amount,
        transaction_type: TransactionType.WITHDRAWAL,
      });

      mock(WalletRepository.findOneBy).mockResolvedValue(wallet);
      mock(TransactionRepository.verify).mockResolvedValue(true);

      const data = await verify();

      expect(PaymentService.verifyTransaction).toHaveBeenLastCalledWith(
        payment_id
      );
      expect(TransactionRepository.findOneBy).toHaveBeenLastCalledWith({
        transaction_id,
      });
      expect(WalletRepository.findOneBy).toHaveBeenLastCalledWith({
        owner: user_id,
      });
      expect(TransactionRepository.verify).toHaveBeenLastCalledWith({
        wallet: { balance: balance - amount }, // will be '+' for topup
        transaction: {
          transaction_id,
          update: { is_successful: true, sender_balance: balance - amount }, // will be '+' for topup
        },
      });

      expect(response.json).toHaveBeenCalledTimes(1);
      expect(data).toStrictEqual(undefined);
    });

    it('throws BadRequestError if payment id is invalid', async () => {
      mock(PaymentService.verifyTransaction).mockResolvedValue({
        success: false,
        transaction_id,
      });
      expect(verify()).rejects.toThrow(BadRequestError);
    });

    it('throws NotFoundError if transaction is not found', async () => {
      mock(PaymentService.verifyTransaction).mockResolvedValue({
        success: true,
        transaction_id,
      });
      mock(TransactionRepository.findOneBy).mockResolvedValue(false);

      expect(verify()).rejects.toThrow(NotFoundError);
    });

    it('throws BadRequestError if transaction is already verified', async () => {
      mock(PaymentService.verifyTransaction).mockResolvedValue({
        success: false,
        transaction_id,
      });

      mock(TransactionRepository.findOneBy).mockResolvedValue({
        transaction_id,
        is_successful: true, // transaction is already verified
        sender_balance: balance,
        amount,
        transaction_type: TransactionType.WITHDRAWAL,
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
