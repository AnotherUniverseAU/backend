import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatCache } from 'src/schemas/chat-cache.schema';

@Injectable()
export class ChatCacheRepository {
  constructor(
    @InjectModel(ChatCache.name) private chatCacheModel: Model<ChatCache>,
  ) {}

  //removes all data from cache = flush
  async refreshCache() {
    await this.chatCacheModel.deleteMany({});
    return true;
  }

  async pushChatLogs(chatLogs: ChatCache[]) {
    await this.chatCacheModel.insertMany(chatLogs);
    return true;
  }

  async findByHour(startOfHour: Date): Promise<ChatCache[]> {
    const endOfHour = new Date(startOfHour.getTime() + 3600000);
    console.log(startOfHour, endOfHour);

    const hourChatLogs = await this.chatCacheModel
      .find({
        timeToSend: {
          $gte: startOfHour,
          $lt: endOfHour,
        },
      })
      .sort({ timeToSend: 1 });

    return hourChatLogs;
  }
}
