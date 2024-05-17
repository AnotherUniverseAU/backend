import { Injectable } from '@nestjs/common';
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
import { Types, UpdateWriteOpResult } from 'mongoose';
import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';
import nicknameModifier from '../global/nickname-modifier';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { UserRepository } from 'src/repository/user.repository';
import { FirebaseService } from 'src/firebase/firebase.service';
import { winstonLogger } from 'src/common/logger/winston.util';
import * as moment from 'moment-timezone';
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
    private userRepo: UserRepository,
    private firebaseService: FirebaseService,
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
    winstonLogger.log('finding chat to send at time');
    const hourCharacterChats =
      await this.characterChatRepo.findByHour(startOfHour);

    if (hourCharacterChats) {
      this.scheduleSend(hourCharacterChats);
    }
    winstonLogger.log('sending chats in an hour: ', hourCharacterChats);
    return hourCharacterChats;
  }

  // 비활성 유저에게 하루 한 번
  // @Cron('* * * * *')
  @Cron('0 11 * * *')
  async sendNotiToInactiveUser() {
    const allUsers = await this.userRepo.findAll();
    winstonLogger.log(`한국시간 21시 정시 알림 비활성 유저들에게 발송 시작`);

    await Promise.all(
      allUsers.map(async (user) => {
        if (!user.fcmToken) {
          winstonLogger.error(
            `fcm토큰이 없어 메시지를 보내지 못했습니다 : ${user._id}`,
          );
          return;
        } else if (user.subscribedCharacters.length === 0) {
          winstonLogger.error(
            `구독한 캐릭터가 없어 메시지를 보내지 못했습니다 : ${user._id}`,
          );
          return;
        }

        let isUserActive: boolean;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (user.lastAccess < yesterday) isUserActive = false;
        else isUserActive = true;

        if (isUserActive) {
          winstonLogger.log(
            `활성 유저에게는 정시 알림을 보내지 않습니다 : ${user._id}`,
          );
          return;
        }

        const title = 'AU';
        const body = '오늘 최애가 보낸 메시지를 확인해 보세요 💌';
        const fcmToken = user.fcmToken;
        await this.firebaseService.sendUserNotification(
          user._id.toString(),
          title,
          body,
          fcmToken,
        );
      }),
    );
  }

  private scheduleSend(hourChatLogs: CharacterChat[]) {
    hourChatLogs.map((characterChat) => {
      const timeTosend = characterChat.timeToSend.getTime();
      const currentTime = new Date().getTime();

      // characterChat 내용 예약
      setTimeout(() => {
        //this goes to user domain currently
        const type = 'chat';
        this.eventEmitter.emit('broadcast', characterChat, type);
      }, timeTosend - currentTime);

      // 답장 있다면 30분 뒤로 예약
      if (characterChat.reply.length > 0) {
        setTimeout(
          () => {
            //this goes to user domain currently
            const type = 'reply';
            this.eventEmitter.emit('broadcast', characterChat, type);
          },
          timeTosend - currentTime + 30 * 60 * 1000,
        );
      }
    });
  }

  async getCharacterChatById(chatId: string): Promise<CharacterChat> {
    const chatCache = await this.characterChatRepo.findById(chatId);
    return chatCache;
  }

  // async bookCharacterReply(
  //   user: UserDocument,
  //   chatId: string,
  //   characterId: string,
  //   userSpecificChat: string[],
  // ) {
  //   const characterChat = await this.getCharacterChatById(chatId);

  //   const replyEventDto = new ReplyEventDto(user, characterChat);

  //   setTimeout(
  //     () => {
  //       this.eventEmitter.emit('send-reply', replyEventDto);

  //       async function setData() {
  //         const chatRoomData = user.chatRoomDatas.get(characterId);
  //         chatRoomData.lastAccess = new Date();
  //         chatRoomData.lastChat = userSpecificChat[userSpecificChat.length - 1];
  //         chatRoomData.unreadCounts = userSpecificChat.length;
  //         chatRoomData.lastChatDate = new Date();
  //         user.chatRoomDatas.set(characterId, chatRoomData);
  //         await user.save();
  //       }
  //       setData();
  //     },
  //     30 * 60 * 1000,
  //   );
  // }

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
    createdDate: Date,
  ): Promise<CharacterChat[]> {
    const characterChats =
      await this.characterChatRepo.findByCharacterIdAndDate(
        characterId,
        date,
        offset,
        createdDate,
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

  async addImageToCharacterChat(
    characterId: string,
    image: Express.Multer.File,
    timeToSend: Date,
  ): Promise<UpdateWriteOpResult> {
    const fileBuffer = image.buffer;
    const koreanTTS = new Date(timeToSend.getTime() + 9 * 60 * 60 * 1000);
    const timeFormat = moment(koreanTTS).format('YYYY-MM-DD/HH-mm');
    const newImageName = `${characterId}/${timeFormat}_${new Types.ObjectId()}.${image.originalname.split('.')[1]}`;

    winstonLogger.log(
      `uploading character chat image for characterId: ${characterId} at ${timeToSend.toISOString()}`,
      newImageName,
    );

    const imageBlob = await this.uploadImageToAzure(fileBuffer, newImageName);

    const imageUrl = imageBlob.fileUrl;

    const result = await this.characterChatRepo.addImageToChat(
      characterId,
      timeToSend,
      imageUrl,
    );

    return result;
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
      `${userId}/${characterId}/${new Date().toUTCString()}` +
      '.' +
      filename.split('.')[1];

    return newFilename;
  }

  async uploadImageToAzure(fileBuffer: Buffer, fileName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const options = { blobHTTPHeaders: { blobContentType: 'image/svg+xml' } };
    const result = await blobClient.upload(
      fileBuffer,
      fileBuffer.length,
      options,
    );
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
