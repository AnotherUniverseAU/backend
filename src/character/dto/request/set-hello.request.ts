import { IsNotEmpty, IsString } from 'class-validator';

export class SetHelloRequest {
  @IsString()
  @IsNotEmpty()
  readonly helloMessage: string[];
  @IsString()
  @IsNotEmpty()
  readonly type: string;
}
