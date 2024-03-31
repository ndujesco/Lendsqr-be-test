import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export interface UserI {
  userId: number;
  firstName: string;
  lastName: string;
  password: string;
  isVerified: boolean;
  otp: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionI {
  transactionId: number;
  transactionType: TransactionType;
  amount: number;
  remark: string;

  receiverBalance: number; // not to be returned
  senderBalance: number; // not to be returned
  walletBalance: number; //to be returned
  sender: number; //walletId
  receiver: number; //walletId
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletI {
  walletId: number;
  balance: number;
  walletNumber: string;
  owner: number; //userId
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  TOP_UP = 'topUp',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}
