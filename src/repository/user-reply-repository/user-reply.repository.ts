import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserReplyDTO } from 'src/chatroom/dto/user-reply.dto';
import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';

@Injectable()
export class UserReplyRepository {
  constructor(
    @InjectModel(UserReply.name) private userReplyModel: Model<UserReply>,
  ) {}

  async save(reply: UserReply): Promise<UserReply> {
    const result = await this.userReplyModel.create({
      characterId: new Types.ObjectId(reply.characterId),
      userId: new Types.ObjectId(reply.userId),
      reply: reply.reply,
      replyTime: reply.replyTime,
      targetContent: reply.targetContent,
      targetTimeToSend: reply.targetTimeToSend,
    });
    return result;
  }
}
