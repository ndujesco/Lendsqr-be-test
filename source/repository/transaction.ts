import db from '../database/db';
import { TransactionI, TransactionType, WalletI } from '../utils/interface';
import { WalletRepository } from './wallet';
export class TransactionRepository {
  static async findAllMyTransactions(userId: number): Promise<TransactionI[]> {
    return await db('transaction')
      .where({ sender: userId })
      .orWhere({ receiver: userId });
  }

  static async findMyTransactionsByType(options: {
    userId: number;
    transactionType: TransactionType;
  }): Promise<TransactionI[]> {
    const { userId, transactionType } = options;
    return await db('transaction')
      .where({ sender: userId, transactionType })
      .orWhere({ receiver: userId, transactionType });
  }

  static async findMyTransactionsByPage(options: {
    userId: number;
    take: number;
    skip: number;
  }): Promise<TransactionI[]> {
    const { userId, take, skip } = options;
    return await db('transaction')
      .where({ sender: userId })
      .orWhere({ receiver: userId })
      .limit(take)
      .offset(skip);
  }

  static async findCommonTransactions(user1: number, user2: number) {
    return await db('transaction')
      .where({ sender: user1, receiver: user2 })
      .orWhere({ sender: user2, receiver: user1 })
      .andWhere({ transactionType: TransactionType.TRANSFER });
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
    transaction: { transactionId: number; update: Partial<TransactionI> };
  }) {
    const { wallet, transaction } = options;

    const { transactionId, update } = transaction;
    const { owner, balance } = wallet;

    try {
      await db.transaction(async (trx) => {
        await WalletRepository.updateOne({
          where: { owner },
          update: { balance },
        });

        await TransactionRepository.updateOne({
          where: { transactionId },
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
      { owner: sender, balance: senderBalance },
      { owner: receiver, balance: receiverBalance },
    ] = wallets;

    try {
      await db.transaction(async (trx) => {
        await WalletRepository.updateOne({
          where: { owner: sender },
          update: { balance: senderBalance },
        });

        await WalletRepository.updateOne({
          where: { owner: receiver },
          update: { balance: receiverBalance },
        });

        await TransactionRepository.create(transactionInfo);
      });
    } catch (err) {
      throw err; // at this point it is probably an issue with the database itself
    }
  }
}
