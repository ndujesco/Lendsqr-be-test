import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../utils/interface';

enum Key {
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  EMAIL = 'email',
  PHONE = 'phone',
}
class UserTransactionsDto {
  @IsEnum(TransactionType)
  @IsOptional()
  transactionType: TransactionType;
}

class GetUserByDto {
  @IsNotEmpty()
  @IsEnum(Key)
  key: Key;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export { UserTransactionsDto, GetUserByDto };
