import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import {
  CharacterChat,
  CharacterChatSchema,
} from 'src/schemas/character-chat.schema';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { AuthModule } from 'src/auth/auth.module';
import { ChatGateway } from './chatroom.gateway';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: CharacterChat.name, schema: CharacterChatSchema },
    ]),
  ],
  providers: [ChatRoomService, CharacterChatRepository, ChatGateway],
  controllers: [ChatRoomController],
})
export class ChatRoomModule {}
