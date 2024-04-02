import {
  IsEmail,
  IsNumber,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @Length(5, 20)
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsPhoneNumber()
  phone: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  otp: string;
}

export class UpdateEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  user_id: number;
}

export class VerifyPasswordDto {
  @Length(5, 20)
  password: string;
}
