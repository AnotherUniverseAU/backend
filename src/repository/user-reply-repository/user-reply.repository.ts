import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      reply: reply.reply.map((reply) => {
        return {
          userReply: reply.userReply,
          replyTime: new Date(reply.replyTime),
        };
      }),
      targetContent: reply.targetContent,
      targetTimeToSend: reply.targetTimeToSend,
      isAfterCharacterReply: reply.isAfterCharacterReply,
    });
    return result;
  }
}
