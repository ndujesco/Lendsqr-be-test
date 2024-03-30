import { Request, Response } from 'express';
import { TransferDto } from '../dto/transaction';
import { AuthRequest } from '../utils/interface';
import { WalletRepository } from '../repository/wallet';

export class TransactionController {
  static async transfer({ body, user }: AuthRequest, res: Response) {
    const { userId } = user;
    console.log(user, body);

    const { receiverId, amount, remark } = body as TransferDto;
    const wallets = WalletRepository.findForTransfer([userId, receiverId]);

    // const
    return res.status(200).json({ message: 'Transfer successful' });
  }
}
