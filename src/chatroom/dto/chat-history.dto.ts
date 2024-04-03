import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';

export class ChatHistoryDTO {
  readonly characterChats: CharacterChat[];
  readonly userReplies: UserReply[];

  constructor(characterChats: CharacterChat[], userReplies: UserReply[]) {
    this.characterChats = characterChats;
    this.userReplies = userReplies;
  }
}
