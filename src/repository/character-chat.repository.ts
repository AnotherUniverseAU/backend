import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatCreationDTO } from 'src/chatroom/dto/chat-creation.dto';
import {
  CharacterChat,
  CharacterChatDocument,
  ChatLog,
} from 'src/schemas/character-chat.schema';

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
}
