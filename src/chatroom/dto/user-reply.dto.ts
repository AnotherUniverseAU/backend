import {
  IsBoolean,
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
  @IsString()
  readonly reply: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly isAfterCharacterReply: boolean;

  readonly isNew?: boolean;

  constructor(
    characterId: string,
    reply: string,
    isAfterCharacterReply: boolean,
    isNew?: boolean,
  ) {
    this.characterId = characterId;
    this.reply = reply;
    this.isAfterCharacterReply = isAfterCharacterReply;
    this.isNew = isNew;
  }
}
