import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { ChatCreationDTO } from 'src/chatroom/dto/chat-creation.dto';
import { ChatReplyDTO } from 'src/chatroom/dto/chat-reply.dto';
import { UnreadChatDTO } from 'src/chatroom/dto/unread-chat.dto';
import { LatestAccessDTO } from 'src/global/dto/last-access.dto';
import { getOneDayWindowPagination } from 'src/global/time.util';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
@Injectable()
export class CharacterChatRepository {
  constructor(
    @InjectModel(CharacterChat.name)
    private characterChatModel: Model<CharacterChat>,
  ) {}

  async findById(chatId: string): Promise<CharacterChat> {
    const chat = await this.characterChatModel.findOne({
      _id: new Types.ObjectId(chatId),
    });
    return chat;
  }

  //if the character Chat exists it appends to that chatlog, if not it creates a new characterChat instances and appends to that chatlog
  //does not return the data, only updates the data
  async addCharacterChat(payload: ChatCreationDTO): Promise<CharacterChat> {
    const characterId = new Types.ObjectId(payload.characterId);

    const result = await this.characterChatModel.create({
      _id: new Types.ObjectId(),
      characterName: payload.characterName,
      characterId: characterId,
      content: payload.content,
      timeToSend: payload.timeToSend,
    });

    return result;
  }

  async findByHour(startOfHour: Date): Promise<CharacterChat[]> {
    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(startOfHour.getHours() + 1);
    const characterChats = await this.characterChatModel.find({
      timeToSend: { $gte: startOfHour, $lte: endOfHour },
    });

    if (characterChats) return characterChats;
    else return [];
  }

  async addManyCharacterChats(
    payload: ChatCreationDTO[],
  ): Promise<CharacterChat[]> {
    const characterChats = payload.map((chatDto) => {
      return new this.characterChatModel({
        _id: new Types.ObjectId(),
        characterId: chatDto.characterId,
        characterName: chatDto.characterName,
        content: chatDto.content,
        reply: [],
        timeToSend: chatDto.timeToSend,
      });
    });

    // Insert all CharacterChat documents into the database
    const result = await this.characterChatModel.insertMany(characterChats);
    return result;
  }

  async addReplies(payload: ChatReplyDTO[]): Promise<any> {
    const bulkOperations = payload.map((chatReplyDTO) => ({
      updateOne: {
        filter: {
          characterId: chatReplyDTO.characterId,
          timeToSend: chatReplyDTO.timeToSend,
        },
        update: { $set: { reply: chatReplyDTO.reply } },
      },
    }));

    const result = await this.characterChatModel.bulkWrite(bulkOperations);
    return result;
  }

  async findByCharacterIdAndDate(
    characterId: string,
    date: Date,
    offset: number,
  ): Promise<CharacterChat[]> {
    const { startOfDay, endOfDay } = getOneDayWindowPagination(date, offset);

    const characterChats = await this.characterChatModel.find({
      characterId: new Types.ObjectId(characterId),
      timeToSend: { $gte: startOfDay, $lt: endOfDay },
    });
    return characterChats;
  }

  async findLastestChatByCharacterId(characterId: string | Types.ObjectId) {
    const pipeline = [
      {
        $match: {
          _id: new Types.ObjectId(characterId),
        },
      },
      {
        $sort: {
          timeToSend: -1, // Sort by 'timeToSend' in descending order to get the latest first
        },
      },
      {
        $limit: 1, // Limit to only 1 document
      },
    ] as PipelineStage[];

    const latestChat = await this.characterChatModel.aggregate(pipeline).exec();
  }

  async findUnreadNumberAndLastestChat(
    lastestAccesses: LatestAccessDTO[],
  ): Promise<UnreadChatDTO[]> {
    const results = await Promise.all(
      lastestAccesses.map(async ({ characterId, lastAccess }) => {
        console.log('ddddd', characterId);

        const pipeline = [
          {
            $match: {
              characterId: new Types.ObjectId(characterId),
            },
          },
          {
            $sort: { timeToSend: -1 },
          },
          {
            $unwind: '$content', // Unwind the content array
          },
          {
            $group: {
              _id: '$characterId', // Group by 'characterId'
              // Conditionally count 'content' elements based on 'timeToSend'
              unreadCount: {
                $sum: {
                  $cond: {
                    if: { $gte: ['$timeToSend', new Date(lastAccess)] }, // Condition
                    then: 1, // Count if 'timeToSend' is greater than or equal to 'lastAccess'
                    else: 0, // Do not count otherwise
                  },
                },
              },
              latestChat: { $first: '$$ROOT' }, // Get the latest chat document
            },
          },
        ] as PipelineStage[];

        const result = await this.characterChatModel
          .aggregate(pipeline)
          .exec()[0];

        // The aggregation will return an array, so we take the first element
        const unreadChatDTO = new UnreadChatDTO(
          result.characterId,
          result.unreadCount,
          result.latestChat,
        );

        return unreadChatDTO;
      }),
    );

    return results;
  }
}
