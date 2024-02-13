import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatCreationDTO } from 'src/chatroom/dto/chat-creation.dto';
import {
  CharacterChat,
  CharacterChatDocument,
  ChatLog,
} from 'src/schemas/character-chat.schema';
import { ChatCache } from 'src/schemas/chat-cache.schema';

@Injectable()
export class CharacterChatRepository {
  constructor(
    @InjectModel(CharacterChat.name)
    private characterChatModel: Model<CharacterChat>,
  ) {}

  async findOrCreate(payload: ChatCreationDTO): Promise<CharacterChatDocument> {
    const characterId = payload.characterId;

    let characterChat = await this.characterChatModel.findOne({
      characterId: characterId,
    });

    const chatLogEntry = {
      characterId: new Types.ObjectId(payload.characterId),
      content: payload.content,
      imgUrl: payload.imgUrl,
      timeToSend: payload.timeToSend,
    };

    if (characterChat) {
      characterChat.chatLog.push(chatLogEntry);
    } else {
      characterChat = new this.characterChatModel({
        characterId: new Types.ObjectId(payload.characterId),
        chatLog: [chatLogEntry],
      });
    }

    return await characterChat.save();
  }

  async findByIdAndTime(
    characterId: string,
    timestamp: Date,
  ): Promise<ChatLog[]> {
    // can only get data from three days ago.
    const timeLimit = new Date();
    timeLimit.setDate(timeLimit.getDate() - 3);

    let timeCriteria: Date;
    if (timeLimit > timestamp) timeCriteria = timeLimit;
    else timeCriteria = timestamp;
    console.log(timeCriteria);
    let characterChats = await this.characterChatModel.aggregate([
      { $match: { characterId: new Types.ObjectId(characterId) } },
      {
        $project: {
          chatLog: {
            $filter: {
              input: '$chatLog',
              as: 'log',
              cond: {
                $and: [
                  { $gt: ['$$log.timeToSend', new Date(timeCriteria)] },
                  { $lt: ['$$log.timeToSend', new Date()] },
                ],
              },
            },
          },
          _id: 0,
        },
      },
    ]);
    if (characterChats) return characterChats[0].chatLog as ChatLog[];
    else return [];
    // The result will contain characterChat documents, but chatLog array will only contain the entries that match the criteria
  }

  //retreive all the chats from all characters scheduled in the same day
  async findByDay(start: Date): Promise<ChatCache[]> {
    console.log('starting at ', start);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    let characterChats = await this.characterChatModel.aggregate([
      { $unwind: '$chatLog' }, // Deconstructs the chatLog array
      {
        $match: {
          // Apply your time-based filtering after unwinding
          'chatLog.timeToSend': {
            $gt: new Date(start),
            $lt: new Date(end),
          },
        },
      },
      {
        $group: {
          // Group all chatLog entries into a single array
          _id: null, // Null because we don't need to group by a specific field
          chatLog: { $push: '$chatLog' }, // Collects all chatLog entries
        },
      },
      { $project: { _id: 0, chatLog: 1 } }, // Exclude _id and include chatLog in the result
    ]);

    const chatLogs = characterChats.length > 0 ? characterChats[0].chatLog : [];
    return chatLogs;
  }
}
