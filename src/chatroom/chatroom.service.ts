import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { UserDocument } from 'src/schemas/user.schema';
import { ChatRecoverDTO } from './dto/chat-recover.dto';
import {
  CharacterChatDocument,
  ChatLog,
} from 'src/schemas/character-chat.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { Cron } from '@nestjs/schedule';
import { ChatCacheRepository } from 'src/repository/chat-cache.repository';
import { ChatCache } from 'src/schemas/chat-cache.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class ChatRoomService {
  constructor(
    private characterChatRepo: CharacterChatRepository,
    private chatCacheRepo: ChatCacheRepository,
    private eventEmitter: EventEmitter2,
  ) {
    this.flushAndRetreieveChatLogToCache();
    this.checkChatTimeToSend();
  }

  @Cron('0 0 * * *')
  async flushAndRetreieveChatLogToCache() {
    const start = new Date();
    console.log('begin refreshing cache for: ', start);
    await this.chatCacheRepo.refreshCache();

    console.log('refresh complete');
    const todayChatLogs = await this.characterChatRepo.findByDay(start);
    await this.chatCacheRepo.pushChatLogs(todayChatLogs);

    console.log("pushing today's chat log complete with: ", todayChatLogs);
    return todayChatLogs;
  }

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
      const timeTOsend = chatCache.timeToSend.getTime();
      const currentTime = new Date().getTime();

      setTimeout(() => {
        this.eventEmitter.emit('broadcast', chatCache);
      }, timeTOsend - currentTime);
    });
  }

  async recoverChat(
    user: UserDocument,
    payload: ChatRecoverDTO,
  ): Promise<Record<string, ChatLog[]>> {
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

  async createChat(payload: ChatCreationDTO): Promise<CharacterChatDocument> {
    const characterChat = await this.characterChatRepo.findOrCreate(payload);
    return characterChat;
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
  ): Promise<Record<string, ChatLog[]>> {
    const dictionary: Record<string, ChatLog[]> = {};

    await Promise.all(
      validatedCharacterIds.map(async (id) => {
        const characterChat = await this.characterChatRepo.findByIdAndTime(
          id,
          timestamp,
        );
        dictionary[id] = characterChat;
      }),
    );

    return dictionary;
  }
}
