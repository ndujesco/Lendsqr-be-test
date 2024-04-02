import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TransactionType } from '../util/interface.util';

export enum Key {
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  EMAIL = 'email',
  PHONE = 'phone',
}
export class UserTransactionsDto {
  @IsEnum(TransactionType)
  @IsOptional()
  transaction_type: TransactionType;
}

export class GetUserByDto {
  @IsNotEmpty()
  @IsEnum(Key)
  key: Key;

  @IsString()
  @IsNotEmpty()
  value: string;
}
