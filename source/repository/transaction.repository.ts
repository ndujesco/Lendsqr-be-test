import db from '../database/db';

import { WalletRepository } from './wallet.repository';

import { TransactionI, TransactionType, WalletI } from '../util/interface.util';
export class TransactionRepository {
  static async findAllMyTransactions(user_id: number): Promise<TransactionI[]> {
    return await db('transaction')
      .where({ sender: user_id })
      .orWhere({ receiver: user_id });
  }

  static async findMyTransactionsByType(options: {
    user_id: number;
    transaction_type: TransactionType;
  }): Promise<TransactionI[]> {
    const { user_id, transaction_type } = options;
    return await db('transaction')
      .where({ sender: user_id, transaction_type })
      .orWhere({ receiver: user_id, transaction_type });
  }

  static async findMyTransactionsByPage(options: {
    user_id: number;
    take: number;
    skip: number;
  }): Promise<TransactionI[]> {
    const { user_id, take, skip } = options;
    return await db('transaction')
      .where({ sender: user_id })
      .orWhere({ receiver: user_id })
      .limit(take)
      .offset(skip);
  }

  static async findCommonTransactions(user1: number, user2: number) {
    return await db('transaction')
      .where({ sender: user1, receiver: user2 })
      .orWhere({ sender: user2, receiver: user1 })
      .andWhere({ transaction_type: TransactionType.TRANSFER });
  }

  static async create(
    createTransactionInfo: Partial<TransactionI>
  ): Promise<number[]> {
    return await db('transaction').insert(createTransactionInfo);
  }

  static async findOneBy(where: Partial<TransactionI>): Promise<TransactionI> {
    return await db('transaction').where(where).first();
  }

  private static async updateOne(options: {
    where: Partial<TransactionI>;
    update: Partial<TransactionI>;
  }): Promise<TransactionI> {
    const { where, update } = options;
    return await db('transaction').where(where).update(update);
  }

  static async verify(options: {
    wallet: WalletI;
    transaction: { transaction_id: number; update: Partial<TransactionI> };
  }) {
    const { wallet, transaction } = options;

    const { transaction_id, update } = transaction;
    const { owner, balance } = wallet;

    try {
      await db.transaction(async (trx) => {
        await WalletRepository.updateOne({
          where: { owner },
          update: { balance },
        });

        await TransactionRepository.updateOne({
          where: { transaction_id },
          update,
        });
      });
    } catch (err) {
      throw err; // at this point it is probably an issue with the database itself
    }
  }

  static async transfer(options: {
    wallets: [WalletI, WalletI];
    transactionInfo: Partial<TransactionI>;
  }) {
    const { wallets, transactionInfo } = options;
    const [
      { owner: sender, balance: sender_balance },
      { owner: receiver, balance: receiver_balance },
    ] = wallets;

    try {
      await db.transaction(async (trx) => {
        await WalletRepository.updateOne({
          where: { owner: sender },
          update: { balance: sender_balance },
        });

        await WalletRepository.updateOne({
          where: { owner: receiver },
          update: { balance: receiver_balance },
        });

        await TransactionRepository.create(transactionInfo);
      });
    } catch (err) {
      throw err; // at this point it is probably an issue with the database itself
    }
  }
}
