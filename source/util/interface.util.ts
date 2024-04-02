import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export interface UserI {
  user_id: number;
  first_name: string;
  last_name: string;
  password: string;
  is_verified: boolean;
  otp: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionI {
  transaction_id: number;
  transaction_uuid: string;
  transaction_type: TransactionType;
  amount: number;
  remark: string;

  receiver_balance: number; // not to be returned
  sender_balance: number; // not to be returned
  walletBalance: number; //to be returned
  sender: number; //wallet_id
  receiver: number; //wallet_id
  created_at: Date;
  updated_at: Date;

  is_successful: boolean;
}

export interface WalletI {
  wallet_id: number;
  balance: number;
  wallet_number: string;
  owner: number; //user_id
  created_at: Date;
  updated_at: Date;
}

export enum TransactionType {
  TOP_UP = 'topup',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}
