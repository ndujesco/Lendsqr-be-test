import {
  IsEmail,
  IsNumber,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

class SignInDto {
  @IsEmail()
  email: string;

  @Length(5, 20)
  password: string;
}

class SignUpDto extends SignInDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  phone: string;
}

class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  otp: string;
}

class UpdateEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  userId: number;
}

class VerifyPasswordDto {
  @Length(5, 20)
  password: string;
}

export {
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
  UpdateEmailDto,
  VerifyPasswordDto,
};
