import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatCreationDTO } from 'src/chatroom/dto/chat-creation.dto';
import { ChatReplyDTO } from 'src/chatroom/dto/chat-reply.dto';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { ChatLog } from 'src/schemas/chat-schema/chat-log.schema';
@Injectable()
export class CharacterChatRepository {
  constructor(
    @InjectModel(CharacterChat.name)
    private characterChatModel: Model<CharacterChat>,
  ) {}

  //if the character Chat exists it appends to that chatlog, if not it creates a new characterChat instances and appends to that chatlog
  //does not return the data, only updates the data
  async addCharacterChat(payload: ChatCreationDTO): Promise<CharacterChat> {
    const characterId = new Types.ObjectId(payload.characterId);
    const newChatLog: ChatLog = {
      characterId: characterId,
      content: payload.content,
      imgUrl: payload.imgUrl,
      timeToSend: payload.timeToSend,
    };

    const result = await this.characterChatModel.create({
      chatLog: newChatLog,
    });

    return result;
  }

  async addManyCharacterChats(
    payload: ChatCreationDTO[],
  ): Promise<CharacterChat[]> {
    const characterChats = payload.map((chatLogDto) => {
      return new this.characterChatModel({
        chatLog: {
          characterId: chatLogDto.characterId,
          content: chatLogDto.content,
          reply: [],
          imgUrl: chatLogDto.imgUrl,
          timeToSend: chatLogDto.timeToSend,
        },
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
          'chatLog.characterId': chatReplyDTO.characterId,
          'chatLog.timeToSend': chatReplyDTO.timeToSend,
        },
        update: { $set: { 'chatLog.reply': chatReplyDTO.reply } },
      },
    }));

    const result = await this.characterChatModel.bulkWrite(bulkOperations);
    return result;
  }

  //this is for recovery of chatlogs
  async findByIdAndTime(
    characterId: string,
    timestamp: Date,
  ): Promise<CharacterChat[]> {
    // can only get data from three days ago.
    const timeLimit = new Date();
    timeLimit.setDate(timeLimit.getDate() - 3);

    let timeCriteria: Date;
    if (timeLimit > timestamp) timeCriteria = timeLimit;
    else timeCriteria = timestamp;
    console.log(timeCriteria);

    const characterChats = await this.characterChatModel.find({
      'chatLog.characterId': new Types.ObjectId(characterId),
      'chatLog.timeToSend': { $gt: timeCriteria, $lt: Date() },
    });

    if (characterChats) return characterChats;
    else return [];
  }

  //retreive all the chats from all characters scheduled in the same day
  async findByDay(start: Date): Promise<CharacterChat[]> {
    console.log('starting at ', start);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const characterChats = await this.characterChatModel.find({
      'chatLog.timeToSend': { $gt: start, $lt: end },
    });

    if (characterChats) return characterChats;
    else return [];
  }
}
