import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class OauthDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  // @IsString()
  // @IsNotEmpty()
  // email: string;

  // @IsString()
  // @IsNotEmpty()
  // phoneNum: string;

  // @IsString()
  // @IsNotEmpty()
  // age: number;

  // @IsString()
  // @Transform(({ value }) => value || 'NM')
  // gender: string;

  constructor(
    id: string,
    nickname: string,
    // email: string,
    // phoneNum: string,
    // age: number,
    // gender: string,
  ) {
    this.id = id;
    this.nickname = nickname;
    // this.email = email;
    // this.phoneNum = phoneNum;
    // this.age = age;
    // this.gender = gender;
  }
}
