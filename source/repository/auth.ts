import { Request, Response } from 'express';
import { SignUpDto } from '../dto/auth';
import db from '../database/db';

export default class AuthRepository {
  static async createUser(signUpDto: SignUpDto) {
    return await db('user').insert(signUpDto);
  }
}
