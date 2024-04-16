import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsSemVer,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class ChatCreationDTO {
  @IsNotEmpty()
  characterId: Types.ObjectId; //id of the character
  @IsString()
  characterName: string; //name of the characters of the chat
  @IsArray()
  content: string[]; //the actual content
  @IsDate()
  timeToSend: Date; //time to send the chat

  constructor(
    characterId: Types.ObjectId,
    characterName: string,
    content: string[],
    timeToSend: Date,
  ) {
    this.characterId = characterId;
    this.characterName = characterName;
    this.content = content;
    this.timeToSend = timeToSend;
  }
}
