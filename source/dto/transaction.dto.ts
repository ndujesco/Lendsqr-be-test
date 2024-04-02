import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  @IsNumber()
  receiver_id: number;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsOptional()
  remark: string;
}

export class InitiateTransactionDto {
  @IsNumber()
  @Min(100)
  amount: number;
}

export class VerifyTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  paymentId: number;
}
