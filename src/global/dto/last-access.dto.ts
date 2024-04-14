import { ChatRoomData } from 'src/schemas/user.schema';

export class LatestAccessDTO {
  readonly characterId: string;
  readonly lastAccess: Date;
  readonly lastChat: string;
  readonly unreadCount: number;
  readonly lastChatDate: Date;
  readonly createdDate: Date;
  readonly nickname: string;

  constructor(chatRoomData: ChatRoomData) {
    this.characterId = chatRoomData.characterId.toString();
    this.lastAccess = chatRoomData.lastAccess;
    this.lastChat = chatRoomData.lastChat;
    this.unreadCount = chatRoomData.unreadCounts;
    this.lastChatDate = chatRoomData.lastChatDate;
    this.createdDate = chatRoomData.createdDate;
    this.nickname = chatRoomData.nickname;
  }
}
