import { HttpException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ChatRecoverDTO } from './dto/chat-recover.dto';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatRoomUtils } from './chatroom.utils';
import { Character } from 'src/schemas/character.schema';
@Injectable()
export class ChatRoomService {
  constructor(
    private characterChatRepo: CharacterChatRepository,
    private eventEmitter: EventEmitter2,
    private chatRoomUtils: ChatRoomUtils,
  ) {}

  //check every hour
  @Cron('0 * * * *')
  async checkChatTimeToSend() {
    const startOfHour = new Date();
    console.log('finding chat to send at time: ', startOfHour);
    const hourCharacterChats =
      await this.characterChatRepo.findByHour(startOfHour);

    if (hourCharacterChats) {
      this.scheduleSend(hourCharacterChats);
    }
    console.log('sending chats in an hour: ', hourCharacterChats);
    return hourCharacterChats;
  }

  private scheduleSend(hourChatLogs: CharacterChat[]) {
    hourChatLogs.map((characterChat) => {
      const timeTOsend = characterChat.timeToSend.getTime();
      const currentTime = new Date().getTime();

      setTimeout(() => {
        //this goes to both chat-gateway and firebase service
        this.eventEmitter.emit('broadcast', characterChat);
      }, timeTOsend - currentTime);
    });
  }

  async getCharacterChat(chatId: string): Promise<CharacterChat> {
    const chatCache = await this.characterChatRepo.findById(chatId);
    return chatCache;
  }

  async handleReplyRequest(chatId: string) {
    const characterChat = await this.getCharacterChat(chatId);
    return characterChat;
  }

  async recoverChat(
    user: UserDocument,
    payload: ChatRecoverDTO,
  ): Promise<Record<string, CharacterChat[]>> {
    const { characterIds, timestamp } = payload;
    console.log('requesting ', characterIds);
    //check if requested characterIds are valid
    const validatedCharacterIds = this.validateRecoverRequest(
      user,
      characterIds,
    );
    console.log('retrieving from :', validatedCharacterIds);
    //retrieve chat logs based on characterId
    const chatDict = await this.retrieveChat(validatedCharacterIds, timestamp);
    return chatDict;
  }

  async createChat(payload: ChatCreationDTO): Promise<CharacterChat> {
    const result = await this.characterChatRepo.addCharacterChat(payload);
    return result;
  }

  async createMultipleChat(
    characterId: string,
    file: Express.Multer.File,
  ): Promise<{ chatHeaders: string[]; errorLines: string[] }> {
    const lines = await this.chatRoomUtils.changeBufferToReadableStrings(
      file.buffer,
    );
    //chatCreationDTOs is the parsed chat from the file
    const { chatCreationDTOs, errorLines } =
      this.chatRoomUtils.parseTextToChatCreationDTO(characterId, lines);
    //add one instance to create the characterchat document incase this is the first time

    const result =
      await this.characterChatRepo.addManyCharacterChats(chatCreationDTOs);
    const chatHeaders = result.map((chat) => chat.content[0]);
    return { chatHeaders, errorLines };
  }

  async addReplyToChat(
    characterId: string,
    file: Express.Multer.File,
  ): Promise<{ result: any; errorLines: string[]; chatHeaders: string[] }> {
    const lines = await this.chatRoomUtils.changeBufferToReadableStrings(
      file.buffer,
    );
    const { chatReplyDTOs, errorLines } =
      this.chatRoomUtils.parseTextToChatReplyDTO(characterId, lines);
    //returns bulkwrite result but there was an error with that type match so i just set to any
    const result = await this.characterChatRepo.addReplies(chatReplyDTOs);
    const chatHeaders = chatReplyDTOs.map((chat) => chat.reply[0]);
    return { result, errorLines, chatHeaders };
  }

  private validateRecoverRequest(user: UserDocument, characterIds: string[]) {
    const subscribedCharacters = user.subscribedCharacters.map((id) =>
      id.toString(),
    );
    //check if user request is valid, not requesting any additional character
    const validatedCharacters = subscribedCharacters.filter((characterId) => {
      return characterIds.includes(characterId);
    });

    if (!validatedCharacters) {
      throw new WsException(
        'Invalid character request, you have no matching subscription',
      );
    }

    return validatedCharacters;
  }

  private async retrieveChat(
    validatedCharacterIds: string[],
    timestamp: Date,
  ): Promise<Record<string, CharacterChat[]>> {
    const dictionary: Record<string, CharacterChat[]> = {};

    await Promise.all(
      validatedCharacterIds.map(async (characterId) => {
        const characterChat =
          await this.characterChatRepo.findByCharacterIdAndTime(
            characterId,
            timestamp,
          );
        dictionary[characterId] = characterChat;
      }),
    );

    return dictionary;
  }
}
