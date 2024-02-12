import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import {
  CharacterChat,
  CharacterChatSchema,
} from 'src/schemas/character-chat.schema';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ChatGateway } from './chatroom.gateway';
import { ChatCacheRepository } from 'src/repository/chat-cache.repository';
import { ChatGatewayService } from './chat-gateway.service';
import { UserRepository } from 'src/repository/user.repository';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ChatCache, ChatCacheSchema } from 'src/schemas/chat-cache.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CharacterChat.name, schema: CharacterChatSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatCache.name, schema: ChatCacheSchema },
    ]),
  ],
  providers: [
    ChatRoomService,
    CharacterChatRepository,
    ChatCacheRepository,
    ChatGateway,
    ChatGatewayService,
    UserRepository,
  ],
  controllers: [ChatRoomController],
})
export class ChatRoomModule {}
