import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';

export class UnreadChatDTO {
  characterId: string;
  unreadCount: number;
  latestChat: CharacterChat | string;

  constructor(
    characterId: string,
    unreadCount: number,
    latestChat: CharacterChat | string,
  ) {
    this.characterId = characterId;
    this.unreadCount = unreadCount ? unreadCount : 0;
    this.latestChat = latestChat ? latestChat : null;
  }
}
