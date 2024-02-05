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
  readonly secret: string;
  constructor(
    private configService: ConfigService,
    characterChat: ChatLog,
  ) {
    this.characterId = characterChat.characterId.toString();
    this.content = characterChat.content;
    this.imgUrl = characterChat.imgUrl;
    this.timeToSend = characterChat.timeToSend;
    this.secret = configService.get<string>('CHAT_SECRET');
  }

  toSend() {
    return {
      characterId: this.characterId,
      content: this.content,
      imgUrl: this.imgUrl,
      timeTosend: this.timeToSend,
    };
  }
}
