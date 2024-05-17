import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PostComplainRequest {
  @IsBoolean()
  @IsNotEmpty()
  readonly isRejected: boolean;
  @IsString()
  @IsNotEmpty()
  readonly complainment: string;
}
