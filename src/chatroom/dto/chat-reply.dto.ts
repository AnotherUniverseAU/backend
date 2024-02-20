import { Types } from 'mongoose';

export class ChatReplyDTO {
  constructor(
    readonly characterId: Types.ObjectId,
    readonly reply: string[],
    readonly timeToSend: Date,
  ) {}
}
