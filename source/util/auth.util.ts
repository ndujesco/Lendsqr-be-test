import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { UserI } from './interface.util';

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const createJWT = (user: UserI) => {
  const token = jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    }
  );
  return token;
};
