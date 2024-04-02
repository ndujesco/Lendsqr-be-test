import db from '../database/db';

import { UserI } from '../util/interface.util';
import { WalletRepository } from './wallet.repository';

export class UserRepository {
  static async signUp(userInfo: Partial<UserI>) {
    try {
      db.transaction(async (trx) => {
        const [user_id] = await UserRepository.create(userInfo);
        WalletRepository.create(user_id);
      });
    } catch (error) {
      throw error; // probably an issue with the database
    }
  }
  static async create(createUserInfo: Partial<UserI>): Promise<number[]> {
    return await db('user').insert(createUserInfo);
  }

  static async findOneBy(where: Partial<UserI>): Promise<UserI> {
    return await db('user').where(where).first();
  }

  static async checkEmailOrPhone(where: Partial<UserI>): Promise<UserI> {
    const { email, phone } = where;
    return await db('user').where({ email }).orWhere({ phone }).first();
  }

  static async checkEmailOrId(where: Partial<UserI>): Promise<UserI[]> {
    const { email, user_id } = where;
    return await db('user').where({ email }).orWhere({ user_id });
  }

  static async updateOne(options: {
    where: Partial<UserI>;
    update: Partial<UserI>;
  }): Promise<UserI> {
    const { where, update } = options;
    return await db('user').where(where).update(update);
  }

  static async findMyProfile(user_id: number) {
    return await db('user')
      .select(
        'user_id',
        'first_name',
        'last_name',
        'email',
        'is_verified',
        'phone',
        'balance',
        'wallet_number'
      )
      .where({ user_id })
      .leftJoin('wallet', 'user.user_id', 'wallet.owner')
      .first();
  }

  static async findUserByWalletNumber(wallet_number: string) {
    return await db('wallet')
      .select('user_id', 'first_name', 'last_name', 'email', 'is_verified', 'phone')
      .where({ wallet_number, is_verified: true })
      .leftJoin('user', 'wallet.owner', 'user.user_id')
      .first();
  }

  static async findProfilesBy(key: string, value: string | number) {
    return await db('user')
      .select('user_id', 'first_name', 'last_name', 'email', 'is_verified', 'phone')
      .where(key, value);
  }
}
