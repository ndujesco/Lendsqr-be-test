import { request, Response, NextFunction } from 'express';
// import { AuthRequest } from '../utils/interface';
import jwt from 'jsonwebtoken';
import { AuthError } from './error';
import { AuthRequest } from '../utils/interface';

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    throw new AuthError('No Authentication Provided');
  }

  const [, token] = bearer.split(' '); // destructuring
  if (!token) {
    throw new AuthError('Bearer has no token');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = payload;
    next();
  } catch (e) {
    throw new AuthError('Invalid Token Provided');
  }
};
