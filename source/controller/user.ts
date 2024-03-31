import { Response } from 'express';
import { AuthRequest, TransactionI, TransactionType } from '../utils/interface';
import { UserRepository } from '../repository/user';
import { WalletRepository } from '../repository/wallet';
import { NotFoundError } from '../middleware/error';
import { UserTransactionsDto } from '../dto/user';
import { TransactionRepository } from '../repository/transaction';
import { Helper } from '../utils/helper';

export class UserController {
  static async getMyProfile({ user }: AuthRequest, res: Response) {
    const { userId } = user;

    const foundUser = await UserRepository.findMyProfile(userId);
    if (!foundUser)
      throw new NotFoundError('This user does not exist in the database.');

    res.json({ message: 'Successful', success: true, data: foundUser });
  }

  static async getMyBalance({ user }: AuthRequest, res: Response) {
    const { userId } = user;
    const wallet = await WalletRepository.findOneBy({ owner: userId });
    if (!wallet)
      throw new NotFoundError('This user does not exist in the database.');

    res.json({
      message: 'Successful',
      success: true,
      data: { balance: wallet.balance },
    });
  }

  static async getTransactionsByType(
    { user, query }: AuthRequest,
    res: Response
  ) {
    const { userId } = user;
    const { transactionType } = query as unknown as UserTransactionsDto;

    let transactions: TransactionI[] | Record<TransactionType, TransactionI[]>;

    if (!transactionType) {
      transactions = await TransactionRepository.findAllMyTransactions(userId);
    } else {
      transactions = await TransactionRepository.findMyTransactionsByType({
        userId,
        transactionType,
      });
    }
    transactions = Helper.removeTransactionFields(transactions);
    transactions = Helper.groupByTransactionType(transactions);

    res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getTransactions({ user, query }: AuthRequest, res: Response) {
    const { pageNumber } = query;

    const page = Number(pageNumber) > 0 ? Number(pageNumber) : 1;

    const take = Number(process.env.PER_PAGE);
    const skip = (page - 1) * take;
    const { userId } = user;

    let transactions: TransactionI[] =
      await TransactionRepository.findMyTransactionsByPage({
        userId,
        skip,
        take,
      });

    transactions = Helper.removeTransactionFields(transactions);

    res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getUserFromWalletNumber(
    { user, query }: AuthRequest,
    res: Response
  ) {}
}
