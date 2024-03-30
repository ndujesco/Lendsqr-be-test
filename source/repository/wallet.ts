import db from '../database/db';
import { WalletI } from '../utils/interface';

export class WalletRepository {
  static async getFromAccountNumber(walletNumber: string) {
    return await db('wallet').where({ walletNumber }).first();
  }

  static async create(walletInfo: Partial<WalletI>) {
    return await db('wallet').insert(walletInfo);
  }
}
