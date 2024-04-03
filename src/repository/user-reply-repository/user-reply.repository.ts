import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { off } from 'process';
import { UserReplyDTO } from 'src/chatroom/dto/user-reply.dto';
import { getOneDayWindowPagination } from 'src/global/time.util';
import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';

@Injectable()
export class UserReplyRepository {
  constructor(
    @InjectModel(UserReply.name) private userReplyModel: Model<UserReply>,
  ) {}

  async create(
    userId: Types.ObjectId,
    userReplyDTO: UserReplyDTO,
  ): Promise<UserReply> {
    const newReply = new this.userReplyModel({
      userId: new Types.ObjectId(userId),
      characterId: new Types.ObjectId(userReplyDTO.characterId),
      userReply: userReplyDTO.userReply,
      replyTime: new Date(),
    });

    return await newReply.save();
  }

  async findByIdandDate(
    userId: Types.ObjectId,
    date: Date,
    offset: number,
  ): Promise<UserReply[]> {
    const { startOfDay, endOfDay } = getOneDayWindowPagination(date, offset);

    const userReply = await this.userReplyModel.find({
      userId: userId,
      replyTime: { $gte: startOfDay, $lte: endOfDay },
    });
    return userReply;
  }
}
