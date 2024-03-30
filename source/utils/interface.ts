export interface UserI {
  userId?: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartialUserI extends Partial<UserI> {}

export interface Transaction {
  transactionId?: number;
  transactionType: TransactionType;
  amount: number;
  remark?: string;
  walletBalance: number;
  senderWallet: string; //walletId
  receiverWallet: string; //walletId
  createdAt?: string;
  updatedAt?: string;
}

export interface Wallet {
  walletId?: number;
  balance: number;
  walletNumber: string;
  user: string; //userId
  createdAt?: string;
  updatedAt?: string;
}

enum TransactionType {
  TOP_UP = 'topUp',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}
