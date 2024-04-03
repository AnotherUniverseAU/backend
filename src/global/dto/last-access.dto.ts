import { ChatRoomData } from 'src/schemas/user.schema';

export class LatestAccessDTO {
  readonly characterId: string;
  readonly lastAccess: Date;
  readonly lastChat: string;
  readonly unreadCount: number;

  constructor(chatRoomData: ChatRoomData) {
    this.characterId = chatRoomData.characterId.toString();
    this.lastAccess = chatRoomData.lastAccess;
    this.lastChat = chatRoomData.lastChat;
    this.unreadCount = chatRoomData.unreadCounts;
  }
}
