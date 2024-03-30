import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

class TransferDto {
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  remark: string;
}


export { TransferDto };
