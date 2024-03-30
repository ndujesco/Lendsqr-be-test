import { Request, Response } from 'express';
import { SignUpDto } from '../dto/auth';
import db from '../database/db';
import { UserI, PartialUserI } from '../utils/interface';

export default class AuthRepository {
  static async createUser(createUserInfo: UserI) {
    return await db('user').insert(createUserInfo);
  }

  static async findUserBy(findUserInfo: PartialUserI) {
    return await db('user').where(findUserInfo).first();
  }

  static async hasUser(findUserInfo: PartialUserI) {
    const { email, phone } = findUserInfo;
    return await db('user').where({ email }).orWhere({ phone }).first();
  }
}
