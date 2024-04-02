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
    const { user_id: sender } = user;
    const { receiver_id: receiver, amount, remark } = body as TransferDto;

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
      receiver_balance: receiverWallet.balance,
      sender_balance: senderWallet.balance,
      receiver,
      sender,

      transaction_type: TransactionType.TRANSFER,
      is_successful: true,
    };

    await TransactionRepository.transfer({
      wallets: [senderWallet, receiverWallet],
      transactionInfo,
    });

    return res.json({ message: 'Transfer successful', success: true });
  }

  static async topUp({ body, user }: AuthRequest, res: Response) {
    const { amount } = body;
    const { user_id: owner } = user;

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    const transactionInfo: Partial<TransactionI> = {
      transaction_type: TransactionType.TOP_UP,
      amount,
      receiver_balance: wallet.balance,
      receiver: owner,
    };

    const [transaction_id] = await TransactionRepository.create(transactionInfo);
    const paymentId = transaction_id;

    const checkoutUrl = await PaymentService.initializeTopUp({
      amount,
      transaction_id,
    });

    return res.json({
      message: 'Transaction Initiated',
      success: true,
      data: { paymentId, checkoutUrl },
    });
  }

  static async withdraw({ body, user }: AuthRequest, res: Response) {
    const { amount } = body;
    const { user_id: owner } = user;

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    if (wallet.balance < amount)
      throw new BadRequestError('Insufficient Balance');

    const transactionInfo: Partial<TransactionI> = {
      transaction_type: TransactionType.WITHDRAWAL,
      amount,
      sender_balance: wallet.balance,
      sender: owner,
    };

    const [transaction_id] = await TransactionRepository.create(transactionInfo);
    const paymentId = transaction_id;

    const checkoutUrl = await PaymentService.initializeWithdrawal({
      amount,
      transaction_id,
    });

    return res.json({
      message: 'Transaction Initiated',
      success: true,
      data: { paymentId, checkoutUrl },
    });
  }

  static async verify({ body, user }: AuthRequest, res: Response) {
    const { paymentId } = body;
    const { user_id: owner } = user;

    const verifiedData = await PaymentService.verifyTransaction(paymentId);

    const { success, transaction_id } = verifiedData;
    if (!success) throw new BadRequestError('Invalid payment id');

    const transaction = await TransactionRepository.findOneBy({
      transaction_id,
    });
    if (!transaction) throw new NotFoundError('Transaction not found.');

    if (transaction.is_successful)
      throw new BadRequestError('This transaction is already verified');

    const wallet = await WalletRepository.findOneBy({ owner });
    if (!wallet) throw new NotFoundError('User not found.');

    const { amount, transaction_type } = transaction;

    if (transaction_type === TransactionType.WITHDRAWAL) {
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
      sender_balance: transaction.sender_balance - amount,
      is_successful: true,
    };

    await TransactionRepository.verify({
      wallet,
      transaction: {
        transaction_id: transaction.transaction_id,
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
      receiver_balance: transaction.receiver_balance + amount,
      is_successful: true,
    };

    await TransactionRepository.verify({
      wallet,
      transaction: {
        transaction_id: transaction.transaction_id,
        update,
      },
    });
  }
}
