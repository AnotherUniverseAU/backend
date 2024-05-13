import { Types } from 'mongoose';

export class ChatRoomData {
  constructor(
    public characterId: Types.ObjectId,
    public nickname: string,
    public createdDate: Date,
    public lastAccess: Date,
    public lastChat: string,
    public unreadCounts: number,
    public lastChatDate: Date,
  ) {}
}
