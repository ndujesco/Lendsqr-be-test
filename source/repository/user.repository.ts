import db from '../database/db';

import { UserI } from '../util/interface.util';

export class UserRepository {
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
    const { email, userId } = where;
    return await db('user').where({ email }).orWhere({ userId });
  }

  static async updateOne(options: {
    where: Partial<UserI>;
    update: Partial<UserI>;
  }): Promise<UserI> {
    const { where, update } = options;
    return await db('user').where(where).update(update);
  }

  static async findMyProfile(userId: number) {
    return await db('user')
      .select(
        'userId',
        'firstName',
        'lastName',
        'email',
        'isVerified',
        'phone',
        'balance',
        'walletNumber'
      )
      .where({ userId })
      .leftJoin('wallet', 'user.userId', 'wallet.owner')
      .first();
  }

  static async findUserByWalletNumber(walletNumber: string) {
    return await db('wallet')
      .select('userId', 'firstName', 'lastName', 'email', 'isVerified', 'phone')
      .where({ walletNumber, isVerified: true })
      .leftJoin('user', 'wallet.owner', 'user.userId')
      .first();
  }

  static async findProfilesBy(key: string, value: string | number) {
    return await db('user')
      .select('userId', 'firstName', 'lastName', 'email', 'isVerified', 'phone')
      .where(key, value);
  }
}
