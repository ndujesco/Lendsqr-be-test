import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

class TransferDto {
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsOptional()
  remark: string;
}

class InitiateTransactionDto {
  @IsNumber()
  @Min(100)
  amount: number;
}

class VerifyTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  paymentId: number;
}

export { TransferDto, InitiateTransactionDto, VerifyTransactionDto };
