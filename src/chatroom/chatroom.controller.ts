import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatRoomService } from './chatroom.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { Request } from 'express';
import { ChatRecoverDTO } from './dto/chat-recover.dto';
import { UserDocument } from 'src/schemas/user.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat-config')
export class ChatRoomController {
  constructor(private chatRoomService: ChatRoomService) {}

  @UseGuards(CommonJwtGuard)
  @Post('recover')
  @HttpCode(200)
  async recoverChat(@Req() req: Request, @Body() payload: ChatRecoverDTO) {
    const user = req.user as UserDocument;
    const chatDict = await this.chatRoomService.recoverChat(user, payload);

    return chatDict;
  }

  @UseGuards(CommonJwtGuard)
  @Get('character-reply/:chatId')
  @HttpCode(200)
  async getCharacterReply(
    @Req() req: Request,
    @Param('chatId') chatId: string,
  ) {
    const user = req.user as UserDocument;
    const reply = await this.chatRoomService.handleReplyRequest(user, chatId);
    return reply;
  }

  //creating character chat. This is only for admin. This creates only one instance.
  @UseGuards(CommonJwtGuard)
  @Post('create')
  @HttpCode(201)
  async createCharcterChat(
    @Req() req: Request,
    @Body() payload: ChatCreationDTO,
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin')
      throw new UnauthorizedException('unauthorized access');

    const newChat = await this.chatRoomService.createChat(payload);
    return { chat: newChat };
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('create-multiple')
  @HttpCode(201)
  async createMultipleCharcterChat(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('characterId') characterId: string,
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin')
      throw new UnauthorizedException('unauthorized access');
    if (!characterId || !file) {
      throw new HttpException(
        'characterId and file must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { errorLines, chatHeaders } =
      await this.chatRoomService.createMultipleChat(characterId, file);

    return { errorLines, chatHeaders };
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('add-reply')
  @HttpCode(201)
  async addReplyToChat(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('characterId') characterId: string,
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin')
      throw new UnauthorizedException('unauthorized access');
    if (!characterId || !file) {
      throw new HttpException(
        'characterId and file must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { result, errorLines, chatHeaders } =
      await this.chatRoomService.addReplyToChat(characterId, file);

    return { result, errorLines, chatHeaders };
  }

  //this is for forcing server to refresh the chat cache for sending chats
  //this should only be used for debugging purpose
  @UseGuards(CommonJwtGuard)
  @Post('force-refresh')
  @HttpCode(200)
  async forceRefreshChatCaching(@Req() req: Request) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Unauthorizzed access');
    }

    const todayChatLogs =
      await this.chatRoomService.flushAndRetreieveChatLogToCache();
    return todayChatLogs;
  }
  //this is for forcing server to check whether there are chats to send
  //this should only be used for debugging purpose
  @UseGuards(CommonJwtGuard)
  @Post('force-time-check')
  @HttpCode(200)
  async forceTimeCheck(@Req() req: Request) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Unauthorizzed access');
    }

    const hourChatLogs = await this.chatRoomService.checkChatTimeToSend();
    return hourChatLogs;
  }
}
