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
  walletBalance: number;
  senderWallet: number; //walletId
  receiverWallet: number; //walletId
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

enum TransactionType {
  TOP_UP = 'topUp',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}
