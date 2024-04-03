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
    const { user_id } = user;

    const foundUser = await UserRepository.findMyProfile(user_id);
    if (!foundUser)
      throw new NotFoundError('This user does not exist in the database.');

    return res.json({ message: 'Successful', success: true, data: foundUser });
  }

  static async getMyBalance({ user }: AuthRequest, res: Response) {
    const { user_id } = user;
    const wallet = await WalletRepository.findOneBy({ owner: user_id });
    if (!wallet)
      throw new NotFoundError('This user does not exist in the database.');

    return res.json({
      message: 'Successful',
      success: true,
      data: { balance: wallet.balance },
    });
  }

  static async getTransactionsByType(
    { user, query }: AuthRequest,
    res: Response
  ) {
    const { user_id } = user;
    const { transaction_type } = query as unknown as UserTransactionsDto;

    let transactions: TransactionI[] | Record<TransactionType, TransactionI[]>;

    if (!transaction_type) {
      transactions = await TransactionRepository.findAllMyTransactions(user_id);
    } else {
      transactions = await TransactionRepository.findMyTransactionsByType({
        user_id,
        transaction_type,
      });
    }
    transactions = Helper.removeTransactionFields(transactions, user_id);
    transactions = Helper.groupByTransactionType(transactions);

    return res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getTransactions({ user, query }: AuthRequest, res: Response) {
    const { page_number } = query;

    const page = Number(page_number) > 0 ? Number(page_number) : 1;

    const take = Number(process.env.PER_PAGE);
    const skip = (page - 1) * take;
    const { user_id } = user;

    let transactions: TransactionI[] =
      await TransactionRepository.findMyTransactionsByPage({
        user_id,
        skip,
        take,
      });

    transactions = Helper.removeTransactionFields(transactions, user_id);

    return res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getCommonTransactions(
    { user, query }: AuthRequest,
    res: Response
  ) {
    const { user_id: loggedUser } = user;
    const otherUser = Number(query.user_id) || 0;

    let transactions = await TransactionRepository.findCommonTransactions(
      loggedUser,
      otherUser
    );
    transactions = Helper.removeTransactionFields(transactions, loggedUser);
    return res.json({
      message: 'Successful',
      success: true,
      data: { transactions },
    });
  }

  static async getUserFromWalletNumber({ query }: AuthRequest, res: Response) {
    const { wallet_number } = query;
    const user = await UserRepository.findUserByWalletNumber(
      String(wallet_number)
    );

    if (!user) throw new NotFoundError('User not found');

    return res.json({
      message: 'Successful',
      success: true,
      data: { user },
    });
  }

  static async getUserFromId({ query }: AuthRequest, res: Response) {
    const user_id = Number(query.user_id) || 0;
    const user = await UserRepository.findProfilesBy('user_id', user_id);

    if (!user.length) throw new NotFoundError('User not found');

    return res.json({
      message: 'Successful',
      success: true,
      data: { user: user[0] },
    });
  }

  static async getUserBy({ query }: AuthRequest, res: Response) {
    const { key, value } = query as unknown as GetUserByDto;

    const users = await UserRepository.findProfilesBy(key, value);

    return res.json({
      message: 'Successful',
      success: true,
      data: { users },
    });
  }
}
