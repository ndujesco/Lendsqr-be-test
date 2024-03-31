import { IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../utils/interface';

class UserTransactionsDto {
  @IsEnum(TransactionType)
  @IsOptional()
  transactionType: TransactionType;
}

export { UserTransactionsDto };
