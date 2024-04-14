import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { User } from 'src/schemas/user.schema';

export class ReplyEventDto {
  constructor(
    readonly user: User,
    readonly characterChat: CharacterChat,
  ) {}
}
