import db from '../database/db';
import { Helper } from '../util/helper.util';

import { WalletI } from '../util/interface.util';

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

  static async updateOne(options: {
    where: Partial<WalletI>;
    update: Partial<WalletI>;
  }): Promise<WalletI> {
    const { where, update } = options;
    return await db('wallet').where(where).update(update);
  }

  static async create(owner: number) {
    // create wallet logic

    let walletNumber;
    let wallet;

    do {
      walletNumber = Helper.generateWalletAccountNumber();
      wallet = await WalletRepository.findByAccountNumber(walletNumber);
    } while (wallet);

    return await db('wallet').insert({ walletNumber, owner });
  }
}
