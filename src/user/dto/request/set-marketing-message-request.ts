import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class SetMarketingMessageRequest {
  @IsDate()
  @IsNotEmpty()
  readonly dateToSend: Date;
  @IsString()
  @IsNotEmpty()
  readonly marketingMessageContent: string;
}
