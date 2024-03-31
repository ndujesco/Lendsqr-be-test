import db from '../database/db';
import { WalletI } from '../utils/interface';

export class WalletRepository {
  static async findByAccountNumber(walletNumber: string) {
    return await db('wallet').where({ walletNumber }).first();
  }

  static async findForTransfer(userIds: [number, number]) {
    const [userId1, userId2] = userIds;
    return (await db('wallet')
      .where({ owner: userId1 })
      .orWhere({ owner: userId2 })) as [WalletI, WalletI];
  }

  static async findOneBy(where: Partial<WalletI>): Promise<WalletI> {
    return await db('wallet').where(where).first();
  }

  static async create(walletInfo: Partial<WalletI>) {
    return await db('wallet').insert(walletInfo);
  }

  static async updateOne(options: {
    where: Partial<WalletI>;
    update: Partial<WalletI>;
  }): Promise<WalletI> {
    const { where, update } = options;
    return await db('wallet').where(where).update(update);
  }
}
