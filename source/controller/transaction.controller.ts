import { Response } from 'express';

import { TransactionRepository } from '../repository/transaction.repository';
import { WalletRepository } from '../repository/wallet.repository';

import { PaymentService } from '../service/payment.service';

import { BadRequestError, NotFoundError } from '../middleware/error.middleware';

import {
  AuthRequest,
  TransactionI,
  TransactionType,
  WalletI,
} from '../util/interface.util';

import { TransferDto } from '../dto/transaction.dto';

export class TransactionController {
  static async transfer({ body, user }: AuthRequest, res: Response) {
    const { userId: sender } = user;
    const { receiverId: receiver, amount, remark } = body as TransferDto;

    const [senderWallet, receiverWallet] = (
      await WalletRepository.findForTransfer([sender, receiver])
    ).sort((a, b) => (Number(a.owner === sender) ? -1 : 1)); // make sure the sender wallet is first

    // This also takes care of when sender === receiver
    if (!senderWallet || !receiverWallet)
      throw new NotFoundError('Please make sure the id is valid.');

    if (senderWallet.balance < amount)
      throw new BadRequestError('Insufficient Balance');

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    const transactionInfo: Partial<TransactionI> = {
      amount,
      remark,
      receiverBalance: receiverWallet.balance,
      senderBalance: senderWallet.balance,
      receiver,
      sender,

      transactionType: TransactionType.TRANSFER,
      isSuccessful: true,
    };

    await TransactionRepository.transfer({
      wallets: [senderWallet, receiverWallet],
      transactionInfo,
    });

    return res.json({ message: 'Transfer successful', success: true });
  }

  static async topUp({ body, user }: AuthRequest, res: Response) {
    const { amount } = body;
    const { userId: owner } = user;

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    const transactionInfo: Partial<TransactionI> = {
      transactionType: TransactionType.TOP_UP,
      amount,
      receiverBalance: wallet.balance,
      receiver: owner,
    };

    const [transactionId] = await TransactionRepository.create(transactionInfo);
    const paymentId = transactionId;

    const checkoutUrl = await PaymentService.initializeTopUp({
      amount,
      transactionId,
    });

    return res.json({
      message: 'Transaction Initiated',
      success: true,
      data: { paymentId, checkoutUrl },
    });
  }

  static async withdraw({ body, user }: AuthRequest, res: Response) {
    const { amount } = body;
    const { userId: owner } = user;

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    if (wallet.balance < amount)
      throw new BadRequestError('Insufficient Balance');

    const transactionInfo: Partial<TransactionI> = {
      transactionType: TransactionType.WITHDRAWAL,
      amount,
      senderBalance: wallet.balance,
      sender: owner,
    };

    const [transactionId] = await TransactionRepository.create(transactionInfo);
    const paymentId = transactionId;

    const checkoutUrl = await PaymentService.initializeWithdrawal({
      amount,
      transactionId,
    });

    return res.json({
      message: 'Transaction Initiated',
      success: true,
      data: { paymentId, checkoutUrl },
    });
  }

  static async verify({ body, user }: AuthRequest, res: Response) {
    const { paymentId } = body;
    const { userId: owner } = user;

    const verifiedData = await PaymentService.verifyTransaction(paymentId);

    const { success, transactionId } = verifiedData;
    if (!success) throw new BadRequestError('Invalid payment id');

    const transaction = await TransactionRepository.findOneBy({
      transactionId,
    });
    if (!transaction) throw new NotFoundError('Transaction not found.');

    if (transaction.isSuccessful)
      throw new BadRequestError('This transaction is already verified');

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    const { amount, transactionType } = transaction;

    if (transactionType === TransactionType.WITHDRAWAL) {
      await TransactionController.effectWithDrawalStatus(
        amount,
        wallet,
        transaction
      );
    } else {
      await TransactionController.effectTopUpStatus(
        amount,
        wallet,
        transaction
      );
    }

    return res.json({
      message: 'Transaction completed successfully!',
      success: true,
    });
  }

  private static async effectWithDrawalStatus(
    amount: number,
    wallet: WalletI,
    transaction: TransactionI
  ) {
    wallet.balance -= amount;

    const update = {
      senderBalance: transaction.senderBalance - amount,
      isSuccessful: true,
    };

    await TransactionRepository.verify({
      wallet,
      transaction: {
        transactionId: transaction.transactionId,
        update,
      },
    });
  }

  private static async effectTopUpStatus(
    amount: number,
    wallet: WalletI,
    transaction: TransactionI
  ) {
    wallet.balance += amount;
    const update = {
      receiverBalance: transaction.receiverBalance + amount,
      isSuccessful: true,
    };

    await TransactionRepository.verify({
      wallet,
      transaction: {
        transactionId: transaction.transactionId,
        update,
      },
    });
  }
}
