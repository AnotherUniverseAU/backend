import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserRepository } from 'src/repository/user.repository';
import { ChatCache } from 'src/schemas/chat-schema/chat-cache.schema';
import { ChatCacheRepository } from 'src/repository/chat-repository/chat-cache.repository';
import { UserReplyDTO } from '../dto/user-reply.dto';
import { UserReplyCacheRepository as UserReplyCacheRepository } from 'src/repository/user-reply-repository/reply-cache.repository';
import { UserReplyRepository } from 'src/repository/user-reply-repository/user-reply.repository';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { ImageReplyDTO } from '../dto/image-reply.dto';
import { ChatLog } from 'src/schemas/chat-schema/chat-log.schema';

@Injectable()
export class ChatGatewayService {
  private containerName: string;
  private blobServiceClient: BlobServiceClient;

  constructor(
    private userRepo: UserRepository,
    private eventEmitter: EventEmitter2,
    private authService: AuthService,
    private chatCacheRepo: ChatCacheRepository,
    private userReplyCacheRepo: UserReplyCacheRepository,
    private userReplyRepo: UserReplyRepository,
    private configService: ConfigService,
  ) {
    this.containerName = this.configService.get('AZURE_STORAGE_CONTAINER_NAME');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }
  async verifyUser(
    client: Socket,
    token: string,
  ): Promise<{ verified: boolean; message: string }> {
    try {
      const payload = await this.authService.verifyToken('access', token);
      client.data.userId = payload.sub;
      return { verified: true, message: 'verification complete' };
    } catch (err) {
      return { verified: false, message: err };
    }
  }

  createDisconnectionTimeout(client: Socket) {
    //time out mark for 10min
    const timeout = setTimeout(
      () => {
        this.eventEmitter.emit('disconnect-user', { socketId: client.id });
      },
      5 * 60 * 1000,
    );

    return timeout;
  }

  async addSocketToRooms(client: Socket) {
    const userId = client.data.userId;

    const user = await this.userRepo.findById(userId);
    const subscribedCharacters = user.subscribedCharacters;
    await Promise.all(
      subscribedCharacters.map((characterId) => {
        client.join(characterId.toString());
      }),
    );
    console.log(`user: ${user.nickname} joined to : ${subscribedCharacters}`);
  }

  disconnectUser(
    client: Socket,
    clientConnectionCheck: Map<string, NodeJS.Timeout>,
    clientSocketMap: Map<string, string>,
  ) {
    console.log('disconnecting: ', client.data.userId);
    client.emit('error', 'disconnecting due to no response');
    const userId = client.data.userId;
    clientConnectionCheck.delete(client.id);
    clientSocketMap.delete(userId);
    client.disconnect();
  }

  async updateChatDataMap(payload: ChatCache) {
    const result = await this.chatCacheRepo.updateOne(payload);
    return result;
  }

  async handleUserReply(
    userId: string,
    userReply: UserReplyDTO,
    chatLog: ChatLog,
  ) {
    const oldReply = await this.userReplyCacheRepo.getUserReply(
      userId,
      userReply.characterId,
    );

    //handling reply to character hello message
    if (userReply.isNew) {
      console.log('handling hello message reply');
      if (oldReply) {
        await this.userReplyCacheRepo.updateUserReplyCache(userId, userReply);
      } else {
        await this.userReplyCacheRepo.createHelloReplyCache(userId, userReply);
      }
      return;
    }

    //---------------------------------------------------------------
    //currently, we write back the cache upon reply of every new character chat
    //but, in case of optimization, we can write back cache on a daily basis
    //---------------------------------------------------------------
    //if old cache exists and targetTimeToSend is different, save to db and update cache
    if (
      oldReply &&
      (new Date(oldReply.targetTimeToSend).getTime() !=
        chatLog.timeToSend.getTime() ||
        oldReply.isAfterCharacterReply != userReply.isAfterCharacterReply)
    ) {
      console.log(
        'oldReply outdated, saving to db and updating cache',
        oldReply,
      );
      await this.userReplyRepo.save(oldReply);
      await this.userReplyCacheRepo.createUserReplyCache(
        userId,
        userReply,
        chatLog,
      );
    } else if (
      //if old cache exists and targetTimeToSend is same, update cache
      oldReply &&
      new Date(oldReply.targetTimeToSend).getTime() ==
        chatLog.timeToSend.getTime()
    ) {
      console.log('reply cache hit, updating cache');
      await this.userReplyCacheRepo.updateUserReplyCache(userId, userReply);
    } else {
      //if old cache does not exist, create new cache
      console.log('creating new reply cache');
      await this.userReplyCacheRepo.createUserReplyCache(
        userId,
        userReply,
        chatLog,
      );
    }
  }

  async handleImageReply(
    userId: string,
    imageReply: ImageReplyDTO,
    chatLog: ChatLog,
  ) {
    const fileBuffer = imageReply.imageBuffer;
    const { newCharacterFileName, newUserFileName } = this.getFileName(
      userId,
      imageReply,
      chatLog.timeToSend,
    );
    const characterResult = await this.uploadImageToAzure(
      fileBuffer,
      newCharacterFileName,
    );
    const userResult = await this.uploadImageToAzure(
      fileBuffer,
      newUserFileName,
    );
    console.log('image upload result: ', characterResult.fileUrl);

    const newUserReply = new UserReplyDTO(
      imageReply.characterId,
      characterResult.fileUrl,
      imageReply.isAfterCharacterReply,
      imageReply.isNew,
    );

    //save to cache as userReply
    await this.handleUserReply(userId, newUserReply, chatLog);

    return { characterResult, userResult };
  }

  getFileName(
    userId: string,
    imageReply: ImageReplyDTO,
    targetTimeToSend: Date,
  ) {
    //this one is for characterGroup save foramt
    const newCharacterFileName =
      `${imageReply.characterId}/${targetTimeToSend}/${userId}-${new Date()}` +
      '.' +
      imageReply.fileFormat;
    //this one is for userGroup save format. If the load is too heavy,
    //this part can be removed
    const newUserFileName =
      `${userId}/${imageReply.characterId}/${targetTimeToSend}/${new Date()}` +
      '.' +
      imageReply.fileFormat;

    return { newCharacterFileName, newUserFileName };
  }

  async uploadImageToAzure(fileBuffer: Buffer, fileName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const result = await blobClient.upload(fileBuffer, fileBuffer.length);
    return { fileUrl: blobClient.url, result };
  }
}
