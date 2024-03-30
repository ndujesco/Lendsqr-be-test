import { Request, Response } from 'express';
import { SignUpDto } from '../dto/auth';
import AuthRepository from '../repository/auth';

export default class AuthController {
  static async signUp({ body: signUpDto }: Request, res: Response) {
    const ans = await AuthRepository.createUser(signUpDto);
    console.log(ans);

    res.json({ message: 'It works!Ï' });
  }
}
