import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatCreationDTO } from 'src/chatroom/dto/chat-creation.dto';
import { ChatReplyDTO } from 'src/chatroom/dto/chat-reply.dto';
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
      characterId: characterId,
      content: payload.content,
      imgUrl: payload.imgUrl,
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
        content: chatDto.content,
        reply: [],
        imgUrl: chatDto.imgUrl,
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

  //this is for recovery of chatlogs
  async findByCharacterIdAndTime(
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
      characterId: new Types.ObjectId(characterId),
      timeToSend: { $gt: timeCriteria, $lt: Date() },
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
      timeToSend: { $gt: start, $lt: end },
    });

    if (characterChats) return characterChats;
    else return [];
  }
}
