import { ConfigService } from '@nestjs/config';
import {
  CharacterChatDocument,
  ChatLog,
} from 'src/schemas/character-chat.schema';

export class CharacterChatDTO {
  readonly characterId: string;
  readonly content: string[];
  readonly imgUrl: string[];
  readonly timeToSend: Date;
  constructor(characterChat: ChatLog) {
    this.characterId = characterChat.characterId.toString();
    this.content = characterChat.content;
    this.imgUrl = characterChat.imgUrl;
    this.timeToSend = characterChat.timeToSend;
  }
}
