import db from '../database/db';
import { TransactionI, WalletI } from '../utils/interface';
import { WalletRepository } from './wallet';
export class TransactionRepository {
  static async create(
    createTransactionInfo: Partial<TransactionI>
  ): Promise<number[]> {
    return await db('transaction').insert(createTransactionInfo);
  }

  static async findOneBy(where: Partial<TransactionI>): Promise<TransactionI> {
    return await db('transaction').where(where).first();
  }

  static async updateOne(options: {
    where: Partial<TransactionI>;
    update: Partial<TransactionI>;
  }): Promise<TransactionI> {
    const { where, update } = options;
    return await db('transaction').where(where).update(update);
  }

  static async topUp(options: {
    wallet: WalletI;
    transactionInfo: Partial<TransactionI>;
  }) {
    const { wallet, transactionInfo } = options;
    const { owner, balance } = wallet;

    try {
      await db.transaction(async (trx) => {
        await WalletRepository.updateOne({
          where: { owner },
          update: { balance },
        });

        await TransactionRepository.create(transactionInfo);
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
