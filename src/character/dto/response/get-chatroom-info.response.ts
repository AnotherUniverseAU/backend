import { ChatRoomData } from 'src/user/dto/domain/chatroom';
import { Character } from '../domain';

export class GetChatRoomInfoResponse {
  constructor(
    readonly profilePicUrl: string,
    readonly name: string,
    readonly chatRoomData: {
      readonly characterId: string;
      readonly nickname: string;
      readonly createDate: Date;
      readonly lastAccess: Date;
      readonly lastChat: string;
      readonly unreadCounts: number;
      readonly lastChatDate: Date;
    },
  ) {}

  static fromDomain(character: Character, chatRoomData: ChatRoomData) {
    return new GetChatRoomInfoResponse(
      character.profilePicUrl,
      character.name,
      {
        characterId: chatRoomData.characterId.toString(),
        nickname: chatRoomData.nickname,
        createDate: chatRoomData.createdDate,
        lastAccess: chatRoomData.lastAccess,
        lastChat: chatRoomData.lastChat,
        unreadCounts: chatRoomData.unreadCounts,
        lastChatDate: chatRoomData.lastChatDate,
      },
    );
  }
}
