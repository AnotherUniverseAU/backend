import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CharacterChatRepository } from 'src/repository/chat-repository/character-chat.repository';
import { UserDocument } from 'src/schemas/user.schema';
import { ChatRecoverDTO } from './dto/chat-recover.dto';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { Cron } from '@nestjs/schedule';
import { ChatCacheRepository } from 'src/repository/chat-repository/chat-cache.repository';
import { ChatCache } from 'src/schemas/chat-schema/chat-cache.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatRoomUtils } from './chatroom.utils';
@Injectable()
export class ChatRoomService {
  constructor(
    private characterChatRepo: CharacterChatRepository,
    private chatCacheRepo: ChatCacheRepository,
    private eventEmitter: EventEmitter2,
    private chatRoomUtils: ChatRoomUtils,
  ) {
    this.flushAndRetreieveChatLogToCache();
    this.checkChatTimeToSend();
  }
  //this is ran at 15:00 everyday because of utc
  @Cron('0 15 * * *')
  async flushAndRetreieveChatLogToCache() {
    const start = new Date();
    console.log('begin refreshing cache for: ', start);
    await this.chatCacheRepo.refreshCache();

    console.log('refresh complete');
    const todayCharacterChat = await this.characterChatRepo.findByDay(start);

    const result = await this.chatCacheRepo.pushChatLogs(todayCharacterChat);

    console.log(
      "pushing today's chat log complete with: ",
      todayCharacterChat,
      result,
    );
    return todayCharacterChat;
  }

  async moveOldChatsToArchive() {}
  //check every hour
  @Cron('0 * * * *')
  async checkChatTimeToSend() {
    const startOfHour = new Date();
    console.log('finding chat to send at time: ', startOfHour);
    const hourChatLogs = await this.chatCacheRepo.findByHour(startOfHour);

    if (hourChatLogs) {
      this.scheduleSend(hourChatLogs);
    }
    console.log('sending chats in an hour: ', hourChatLogs);
    return hourChatLogs;
  }

  private scheduleSend(hourChatLogs: ChatCache[]) {
    hourChatLogs.map((chatCache) => {
      const timeTOsend = chatCache.chatLog.timeToSend.getTime();
      const currentTime = new Date().getTime();

      setTimeout(() => {
        this.eventEmitter.emit('broadcast', chatCache);
      }, timeTOsend - currentTime);
    });
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
    const chatHeaders = result.map((chat) => chat.chatLog.content[0]);
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
        const characterChat = await this.characterChatRepo.findByIdAndTime(
          characterId,
          timestamp,
        );
        dictionary[characterId] = characterChat;
      }),
    );

    return dictionary;
  }
}
