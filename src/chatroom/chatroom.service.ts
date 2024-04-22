import { HttpException, Injectable } from '@nestjs/common';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ChatRoomUtils } from './chatroom.utils';
import { UserReplyRepository } from 'src/repository/user-reply-repository/user-reply.repository';
import { UserReplyDTO } from './dto/user-reply.dto';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';
import nicknameModifier from '../global/nickname-modifier';
import { chat } from 'googleapis/build/src/apis/chat';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ReplyEventDto } from 'src/global/dto/reply-event.dto';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
@Injectable()
export class ChatRoomService {
  private containerName: string;
  private blobServiceClient: BlobServiceClient;

  constructor(
    private configService: ConfigService,
    private characterChatRepo: CharacterChatRepository,
    private eventEmitter: EventEmitter2,
    private chatRoomUtils: ChatRoomUtils,
    private userReplyRepository: UserReplyRepository,
  ) {
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_CONTAINER_NAME',
    );
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }

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
      const timeTosend = characterChat.timeToSend.getTime();
      const currentTime = new Date().getTime();

      setTimeout(() => {
        //this goes to user domain currently
        this.eventEmitter.emit('broadcast', characterChat);
      }, timeTosend - currentTime);
    });
  }

  async getCharacterChatById(chatId: string): Promise<CharacterChat> {
    const chatCache = await this.characterChatRepo.findById(chatId);
    return chatCache;
  }

  async bookCharacterReply(user: UserDocument, chatId: string) {
    const characterChat = await this.getCharacterChatById(chatId);

    const replyEventDto = new ReplyEventDto(user, characterChat);

    setTimeout(
      () => {
        this.eventEmitter.emit('send-reply', replyEventDto);
      },
      5 * 60 * 1000,
    );
  }

  async handleReplyRequest(
    nickname: string,
    chatId: string,
  ): Promise<string[]> {
    const characterChat = await this.getCharacterChatById(chatId);
    const userSpecificChat = characterChat.reply.map((chat) => {
      return nicknameModifier(nickname, chat);
    }) as string[];
    return userSpecificChat;
  }

  async getCharacterChatByDay(
    characterId: string,
    date: Date,
    offset: number,
  ): Promise<CharacterChat[]> {
    const characterChats =
      await this.characterChatRepo.findByCharacterIdAndDate(
        characterId,
        date,
        offset,
      );

    return characterChats;
  }

  async getUserReplyByDay(
    userId: Types.ObjectId,
    characterId: string,
    date: Date,
    offset: number,
  ): Promise<UserReply[]> {
    const userReplies = await this.userReplyRepository.findByIdandDate(
      userId,
      new Types.ObjectId(characterId),
      date,
      offset,
    );
    return userReplies;
  }

  async createChat(payload: ChatCreationDTO): Promise<CharacterChat> {
    console.log(payload);
    const result = await this.characterChatRepo.addCharacterChat(payload);
    return result;
  }

  async createMultipleChat(
    characterId: string,
    file: Express.Multer.File,
    characterName: string,
  ): Promise<{ chatHeaders: string[]; errorLines: string[] }> {
    const lines = await this.chatRoomUtils.changeBufferToReadableStrings(
      file.buffer,
    );
    //chatCreationDTOs is the parsed chat from the file
    const { chatCreationDTOs, errorLines } =
      this.chatRoomUtils.parseTextToChatCreationDTO(
        characterId,
        characterName,
        lines,
      );
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

  async addUserReply(userId: Types.ObjectId, userReplyDTO: UserReplyDTO) {
    const newUserReply = await this.userReplyRepository.create(
      userId,
      userReplyDTO,
    );
  }

  async addImageReply(
    userId: Types.ObjectId,
    image: Express.Multer.File,
    characterId: string,
  ): Promise<string> {
    const fileBuffer = image.buffer;
    const newFilename = this.getFileName(
      userId.toString(),
      image.originalname,
      characterId,
    );
    const imageBlob = await this.uploadImageToAzure(fileBuffer, newFilename);

    const userReplyDTO = new UserReplyDTO(characterId, imageBlob.fileUrl);
    await this.addUserReply(userId, userReplyDTO);

    return imageBlob.fileUrl;
  }

  getFileName(userId: string, filename: string, characterId: string) {
    //this one is for characterGroup save foramt
    const newFilename =
      `${userId}/${characterId}/${new Date().toUTCString}` +
      '.' +
      filename.split('.')[1];

    return newFilename;
  }

  async uploadImageToAzure(fileBuffer: Buffer, fileName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const result = await blobClient.upload(fileBuffer, fileBuffer.length);
    return { fileUrl: blobClient.url, result };
  }

  @OnEvent('unsubscribe-user')
  async deleteUserReply(payload: SubscriptionEventDTO) {
    await this.userReplyRepository.delete(payload.userId, payload.characterId);
  }

  // async findUnreadNumberAndLastestChat(
  //   latestAccesses: LatestAccessDTO[],
  // ): Promise<UnreadChatDTO[]> {
  //   const userLastAccesses = [];
  //   const characterLastAccesses = [];

  //   await Promise.all(
  //     latestAccesses.map(async (lastAccess) => {
  //       if (lastAccess.isUserLast && !lastAccess.hasCharacterReply) {
  //         userLastAccesses.push(lastAccess);
  //       } else {
  //         characterLastAccesses.push(lastAccess);
  //       }
  //     }),
  //   );

  //   var characterLastChat = [];

  //   if (characterLastAccesses) {
  //     characterLastChat =
  //       await this.characterChatRepo.findUnreadNumberAndLastestChat(
  //         characterLastAccesses,
  //       );
  //   }
  //   var userLastChat = [];
  //   if (userLastAccesses) {
  //     userLastChat = userLastAccesses.map((lastAccess) => {
  //       return new UnreadChatDTO(
  //         lastAccess.characterId,
  //         0,
  //         lastAccess.userLastChat,
  //       );
  //     });
  //   }

  //   const result = characterLastAccesses.concat(userLastChat);
  //   return result;
  // }
}
