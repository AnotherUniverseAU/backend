import { Types } from 'mongoose';
import { ChatRoomData } from './chatroom';

export class User {
  constructor(
    public _id: Types.ObjectId,
    public oauthAccounts: {
      provider: string;
      id: string;
    }[],
    public nickname: string,
    public role: string,
    public isNew: boolean,
    public contributedCharacters: Types.ObjectId[],
    public subscribedCharacters: Types.ObjectId[],
    public chatRoomDatas: Map<string, ChatRoomData>,
    public subscriptionIds: Types.ObjectId[],
    public rejectedIds: Types.ObjectId[],
    public fcmToken: string,
    public lastAccess: Date,
  ) {}
}
