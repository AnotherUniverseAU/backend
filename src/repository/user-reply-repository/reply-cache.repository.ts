import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { UserReplyDTO as UserReplyDTO } from 'src/chatroom/dto/user-reply.dto';
import {
  UserReply,
  UserReplyDocument,
} from 'src/schemas/chat-schema/user-reply.schema';

@Injectable()
export class UserReplyCacheRepository {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async getUserReply(userId: string, characterId: string): Promise<UserReply> {
    const reply = await this.redisClient.hget(`reply:${userId}`, characterId);

    return JSON.parse(reply) as UserReply;
  }

  async updateUserReplyCache(
    userId: string,
    userReply: UserReplyDTO,
  ): Promise<void> {
    const replyKey = `reply:${userId}`;
    const chatCacheJSON = await this.redisClient.hget(
      replyKey,
      userReply.characterId,
    );
    const chatCache = JSON.parse(chatCacheJSON) as UserReply;
    chatCache.reply = chatCache.reply.concat(userReply.reply);
    await this.redisClient.hset(
      replyKey,
      userReply.characterId,
      JSON.stringify(chatCache),
    );
  }

  async createUserReplyCache(
    userId: string,
    userReply: UserReplyDTO,
    content: string[],
  ): Promise<void> {
    const replyKey = `reply:${userId}`;
    await this.redisClient.hset(
      replyKey,
      userReply.characterId,
      JSON.stringify({
        userId,
        charcterId: userReply.characterId,
        reply: userReply.reply,
        replyTime: new Date(),
        targetContent: content,
        targetTimeToSend: userReply.targetTimeToSend,
      }),
    );
  }
}
