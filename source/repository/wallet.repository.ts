import db from '../database/db';
import { Helper } from '../util/helper.util';

import { WalletI } from '../util/interface.util';

export class WalletRepository {
  static async findByAccountNumber(wallet_number: string) {
    return await db('wallet').where({ wallet_number }).first();
  }

  static async findForTransfer(user_ids: [number, number]) {
    const [user_id1, user_id2] = user_ids;
    return (await db('wallet')
      .where({ owner: user_id1 })
      .orWhere({ owner: user_id2 })) as [WalletI, WalletI];
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

    let wallet_number;
    let wallet;

    do {
      wallet_number = Helper.generateWalletAccountNumber();
      wallet = await WalletRepository.findByAccountNumber(wallet_number);
    } while (wallet);

    return await db('wallet').insert({ wallet_number, owner });
  }
}
