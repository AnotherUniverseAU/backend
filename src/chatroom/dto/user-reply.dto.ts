import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
} from 'class-validator';

export class UserReplyDTO {
  @IsNotEmpty()
  @IsString()
  readonly characterId: string;

  @IsNotEmptyObject()
  @IsString({ each: true })
  readonly reply: string[];

  @IsNotEmpty()
  @IsDate()
  readonly targetTimeToSend: Date;

  constructor(characterId: string, reply: string[], targetTimeToSend: Date) {
    this.characterId = characterId;
    this.reply = reply;
    this.targetTimeToSend = targetTimeToSend;
  }
}
