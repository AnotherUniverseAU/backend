import { IsNotEmpty, IsString } from 'class-validator';

export class SetCharacterHelloRequest {
  @IsString()
  @IsNotEmpty()
  readonly helloMessage: string[];
  @IsString()
  @IsNotEmpty()
  readonly type: string;
}
