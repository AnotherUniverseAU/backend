import { IsNotEmpty, IsString } from 'class-validator';

export class SetCharacterHelloRequest {
  @IsNotEmpty()
  readonly helloMessage: string[];
  @IsString()
  @IsNotEmpty()
  readonly type: string;
}
