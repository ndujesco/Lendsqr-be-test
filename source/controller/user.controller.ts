import { Response } from 'express';

import { UserRepository } from '../repository/user.repository';
import { WalletRepository } from '../repository/wallet.repository';
import { TransactionRepository } from '../repository/transaction.repository';

import { NotFoundError } from '../middleware/error.middleware';

import { Helper } from '../util/helper.util';
import {
  AuthRequest,
  TransactionI,
  TransactionType,
} from '../util/interface.util';

import { GetUserByDto, UserTransactionsDto } from '../dto/user.dto';

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
    transactions = Helper.removeTransactionFields(transactions, userId);
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

    transactions = Helper.removeTransactionFields(transactions, userId);

    res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getCommonTransactions(
    { user, query }: AuthRequest,
    res: Response
  ) {
    const { userId: loggedUser } = user;
    const otherUser = Number(query.userId) || 0;

    const transactions = await TransactionRepository.findCommonTransactions(
      loggedUser,
      otherUser
    );

    res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getUserFromWalletNumber({ query }: AuthRequest, res: Response) {
    const { walletNumber } = query;
    const user = await UserRepository.findUserByWalletNumber(
      String(walletNumber)
    );

    if (!user) throw new NotFoundError('User not found');

    res.json({
      message: 'Successful',
      success: true,
      data: { user },
    });
  }

  static async getUserFromId({ query }: AuthRequest, res: Response) {
    const userId = Number(query.userId) || 0;
    const user = await UserRepository.findProfilesBy('userId', userId);

    if (!user) throw new NotFoundError('User not found');

    res.json({
      message: 'Successful',
      success: true,
      data: { user: user[0] },
    });
  }

  static async getUserBy({ query }: AuthRequest, res: Response) {
    const { key, value } = query as unknown as GetUserByDto;

    const users = await UserRepository.findProfilesBy(key, value);

    res.json({
      message: 'Successful',
      success: true,
      data: { users },
    });
  }
}
