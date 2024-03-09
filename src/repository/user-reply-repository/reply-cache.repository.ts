// import { InjectRedis } from '@nestjs-modules/ioredis';
// import { Injectable } from '@nestjs/common';
// import { Redis } from 'ioredis';
// import { UserReplyDTO as UserReplyDTO } from 'src/chatroom/dto/user-reply.dto';
// import { UserReply } from 'src/schemas/chat-schema/user-reply.schema';

// @Injectable()
// export class UserReplyCacheRepository {
//   constructor(@InjectRedis() private readonly redisClient: Redis) {}

//   async getUserReply(userId: string, characterId: string): Promise<UserReply> {
//     const reply = await this.redisClient.hget(`reply:${userId}`, characterId);

//     return JSON.parse(reply) as UserReply;
//   }

//   async updateUserReplyCache(
//     userId: string,
//     userReply: UserReplyDTO,
//   ): Promise<void> {
//     const replyKey = `reply:${userId}`;
//     const chatCacheJSON = await this.redisClient.hget(
//       replyKey,
//       userReply.characterId,
//     );
//     const chatCache = JSON.parse(chatCacheJSON) as UserReply;
//     chatCache.reply.push({
//       userReply: userReply.reply,
//       replyTime: new Date(),
//     });
//     await this.redisClient.hset(
//       replyKey,
//       userReply.characterId,
//       JSON.stringify(chatCache),
//     );
//   }

//   // async createUserReplyCache(
//   //   userId: string,
//   //   userReply: UserReplyDTO,
//   //   chatLog: ChatLog,
//   // ): Promise<void> {
//   //   const replyKey = `reply:${userId}`;
//   //   //change the content to the character if the user reply is after the character reply
//   //   const targetContent = userReply.isAfterCharacterReply
//   //     ? chatLog.reply
//   //     : chatLog.content;

//   //   const reply = {
//   //     userId,
//   //     charcterId: userReply.characterId,
//   //     reply: [{ userReply: userReply.reply, replyTime: new Date() }],
//   //     targetContent: targetContent,
//   //     targetTimeToSend: chatLog.timeToSend,
//   //     isAfterCharacterReply: userReply.isAfterCharacterReply,
//   //   };

//   //   await this.redisClient.hset(
//   //     replyKey,
//   //     userReply.characterId,
//   //     JSON.stringify(reply),
//   //   );
//   // }

//   async createHelloReplyCache(
//     userId: string,
//     userReply: UserReplyDTO,
//   ): Promise<void> {
//     const replyKey = `reply:${userId}`;
//     const reply = {
//       userId,
//       charcterId: userReply.characterId,
//       reply: [{ userReply: userReply.reply, replyTime: new Date() }],
//       targetContent: ['hello'],
//       targetTimeToSend: new Date(0),
//       isAfterCharacterReply: false,
//     };

//     await this.redisClient.hset(
//       replyKey,
//       userReply.characterId,
//       JSON.stringify(reply),
//     );
//   }
// }
