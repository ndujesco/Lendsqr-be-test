import db from '../database/db';
import { TransactionI } from '../utils/interface';
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
}
