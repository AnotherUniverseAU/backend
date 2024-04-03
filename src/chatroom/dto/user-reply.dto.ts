import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';

export class UserReplyDTO {
  @IsNotEmpty()
  @IsString()
  readonly characterId: string;

  @IsNotEmpty()
  @IsString()
  readonly userReply: string;

  constructor(characterId: string, userReply: string) {
    this.characterId = characterId;
    this.userReply = userReply;
  }
}
