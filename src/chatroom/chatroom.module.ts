import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import {
  CharacterChat,
  CharacterChatSchema,
} from 'src/schemas/chat-schema/character-chat.schema';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/repository/user.repository';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ChatRoomUtils } from './chatroom.utils';
import {
  UserReply,
  UserReplySchema,
} from 'src/schemas/chat-schema/user-reply.schema';
import { UserReplyRepository } from 'src/repository/user-reply-repository/user-reply.repository';
// import { UserReplyCacheRepository } from 'src/repository/user-reply-repository/reply-cache.repository';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CharacterChat.name, schema: CharacterChatSchema },
      { name: User.name, schema: UserSchema },
      { name: UserReply.name, schema: UserReplySchema },
    ]),
  ],
  providers: [
    ChatRoomService,
    CharacterChatRepository,
    UserReplyRepository,
    // UserReplyCacheRepository,
    UserRepository,
    ChatRoomUtils,
  ],
  controllers: [ChatRoomController],
})
export class ChatRoomModule {}
