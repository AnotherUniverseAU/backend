import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { ChatCache } from 'src/schemas/chat-schema/chat-cache.schema';

@Injectable()
export class ChatCacheRepository {
  constructor(
    @InjectModel(ChatCache.name) private chatCacheModel: Model<ChatCache>,
  ) {}

  //removes all data from cache = flush
  async refreshCache(): Promise<any> {
    const reuslt = await this.chatCacheModel.deleteMany({});
    return reuslt;
  }

  async updateOne(payload: ChatCache): Promise<UpdateWriteOpResult> {
    const result = await this.chatCacheModel.updateOne(
      {
        'chatLog.characterId': payload.chatLog.characterId,
        'chatLog.timeToSend': payload.chatLog.timeToSend,
      },
      payload,
    );
    return result;
  }

  async pushChatLogs(characterChats: CharacterChat[]) {
    const ChatCaches = characterChats.map((CharacterChat) => {
      const chatLog = CharacterChat.chatLog;
      return new this.chatCacheModel({
        chatLog,
      });
    });

    const result = await this.chatCacheModel.insertMany(ChatCaches);
    return result;
  }

  async findByHour(startOfHour: Date): Promise<ChatCache[]> {
    //start of hour + 1 hour
    const endOfHour = new Date(startOfHour.getTime() + 3600000);
    console.log(startOfHour, endOfHour);

    const hourChatLogs = await this.chatCacheModel
      .find({
        'chatLog.timeToSend': {
          $gte: startOfHour,
          $lt: endOfHour,
        },
      })
      .sort({ timeToSend: 1 });

    return hourChatLogs;
  }
}
