import { Types } from 'mongoose';
import { ChatRoomData } from 'src/user/dto/domain/chatroom';

export class GetCharacterHelloCommand {
  constructor(
    public readonly characterId: Types.ObjectId,
    public readonly chatRoomData: {
      readonly characterId: Types.ObjectId;
      readonly nickname: string;
      readonly createdDate: Date;
      readonly lastAccess: Date;
      readonly lastChat: string;
      readonly unreadCounts: number;
      readonly lastChatDate: Date;
    },
  ) {}

  static fromRequest(characterId: Types.ObjectId, chatRoomData: ChatRoomData) {
    return new GetCharacterHelloCommand(characterId, {
      characterId: chatRoomData.characterId,
      nickname: chatRoomData.nickname,
      createdDate: chatRoomData.createdDate,
      lastAccess: chatRoomData.lastAccess,
      lastChat: chatRoomData.lastChat,
      unreadCounts: chatRoomData.unreadCounts,
      lastChatDate: chatRoomData.lastChatDate,
    });
  }
}
