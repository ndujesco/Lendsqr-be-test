import { IsEmail, IsPhoneNumber, IsString, Length } from 'class-validator';

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

export { SignInDto, SignUpDto };
