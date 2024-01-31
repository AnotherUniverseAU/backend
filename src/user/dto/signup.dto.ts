import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Gender } from 'src/schemas/user.schema';
export class SignupDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  age: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  phoneNum: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @IsString()
  @IsOptional()
  password?: string;
}
