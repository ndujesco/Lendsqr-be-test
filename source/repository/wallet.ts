import db from '../database/db';
import { WalletI } from '../utils/interface';

export class WalletRepository {
  static async findByAccountNumber(walletNumber: string) {
    return await db('wallet').where({ walletNumber }).first();
  }

  static async findForTransfer(userIds: [number, number]) {
    const [userId1, userId2] = userIds;
    return await db('wallet')
      .where({ userId: userId1 })
      .orWhere({ userId: userId2 });
  }

  static async findBy(walletNumber: string) {
    return await db('wallet').where({ walletNumber }).first();
  }

  static async create(walletInfo: Partial<WalletI>) {
    return await db('wallet').insert(walletInfo);
  }
}
