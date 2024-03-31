import { Request, Response } from 'express';
import { TransferDto } from '../dto/transaction';
import { AuthRequest, TransactionI, TransactionType } from '../utils/interface';
import { WalletRepository } from '../repository/wallet';
import { BadRequestError, NotFoundError } from '../middleware/error';
import { TransactionRepository } from '../repository/transaction';

export class TransactionController {
  static async transfer({ body, user }: AuthRequest, res: Response) {
    const { userId: sender } = user;

    const { receiverId: receiver, amount, remark } = body as TransferDto;
    const [senderWallet, receiverWallet] = (
      await WalletRepository.findForTransfer([sender, receiver])
    ).sort((a, b) => (Number(a.owner === sender) ? -1 : 1)); // make sure the sender wallet is first

    if (!senderWallet || !receiverWallet)
      throw new NotFoundError('Please make sure the id is exists.');

    if (senderWallet.balance < amount)
      throw new BadRequestError('Insufficient Balance');

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    const transactionInfo: Partial<TransactionI> = {
      transactionType: TransactionType.TRANSFER,
      amount,
      remark,
      receiverBalance: receiverWallet.balance,
      senderBalance: senderWallet.balance,
      receiver,
      sender,
    };

    await TransactionRepository.transfer({
      wallets: [senderWallet, receiverWallet],
      transactionInfo,
    });

    return res.status(200).json({ message: 'Transfer successful' });
  }
}
