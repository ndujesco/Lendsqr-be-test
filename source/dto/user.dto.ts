import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { TransactionType } from '../util/interface.util';

export enum Key {
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  EMAIL = 'email',
  PHONE = 'phone',
}

export class GetByUserIdDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  user_id: number;
}

export class GetByWalletNumberDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  wallet_number: number;
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
