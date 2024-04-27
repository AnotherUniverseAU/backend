import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatRoomService } from './chatroom.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { Request } from 'express';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { UserReplyDTO } from './dto/user-reply.dto';
import { LatestAccessDTO as LastAccessDTO } from 'src/global/dto/last-access.dto';
import { ChangeLastAccessInterceptor as LastAccessInterceptor } from './interceptor/change-last-access.interceptor';
import nicknameModifier from '../global/nickname-modifier';
import { winstonLogger } from 'src/common/logger/winston.util';

@Controller('chatroom')
export class ChatRoomController {
  constructor(private chatRoomService: ChatRoomService) {}

  @UseGuards(CommonJwtGuard)
  @Get('')
  @HttpCode(200)
  async getAllChatRooms(@Req() req: Request) {
    const user = req.user as UserDocument;
    user.lastAccess = new Date();
    const chatRoomDatas = user.chatRoomDatas;
    const lastAccessDTOs = Array.from(user.chatRoomDatas.keys()).map(
      (characterId) => {
        const chatRoomData = chatRoomDatas.get(characterId);
        return new LastAccessDTO(chatRoomData);
      },
    );

    winstonLogger.log('getting all chat rooms', {
      user: user._id,
      chatRoomDatas: lastAccessDTOs,
    });
    return { chatRoomDatas: lastAccessDTOs };
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(LastAccessInterceptor)
  @Get('chat-history/:characterId/:timestamp')
  @HttpCode(200)
  async getChatHistory(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @Param('timestamp') timestamp: string,
    @Query('offset') offset: number,
  ) {
    const user = req.user as UserDocument;
    user.lastAccess = new Date();

    if (!offset) offset = 0;

    const date = new Date(timestamp);

    if (isNaN(date.getTime()) || (date > new Date() && user.role != 'admin'))
      throw new HttpException('invalid date', 400);

    const characterChats = await this.chatRoomService.getCharacterChatByDay(
      characterId,
      date,
      offset,
    );

    const chatRoomData = user.chatRoomDatas.get(characterId);

    var nickname = chatRoomData.nickname;
    if (!nickname) nickname = user.nickname;

    characterChats.forEach((chat) => {
      chat.content = chat.content.map((chat) => {
        return nicknameModifier(nickname, chat);
      });
      chat.reply = chat.reply.map((chat) => {
        return nicknameModifier(nickname, chat);
      });
    });

    const userReplies = await this.chatRoomService.getUserReplyByDay(
      user._id,
      characterId,
      date,
      offset,
    );

    const currentDateOffset = new Date(timestamp);
    currentDateOffset.setDate(currentDateOffset.getDate() + offset);

    if (chatRoomData.createdDate <= currentDateOffset && user.role != 'admin')
      return { characterChats: [], userReplies: [], isLast: true };

    return { characterChats, userReplies };
  }

  @UseGuards(CommonJwtGuard)
  // @UseInterceptors(LastAccessInterceptor)
  @Get('character-reply/:characterId/:chatId')
  @HttpCode(200)
  async getCharacterReply(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @Param('chatId') chatId: string,
  ) {
    const user = req.user as UserDocument;
    const chatRoomData = user.chatRoomDatas.get(characterId);
    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;

    const userSpecificChat = await this.chatRoomService.handleReplyRequest(
      nickname,
      chatId,
    );

    chatRoomData.lastAccess = new Date();
    chatRoomData.lastChat = userSpecificChat[userSpecificChat.length - 1];
    chatRoomData.unreadCounts = userSpecificChat.length;
    chatRoomData.lastChatDate = new Date();
    user.chatRoomDatas.set(characterId, chatRoomData);
    await user.save();

    return { characterId, reply: userSpecificChat };
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
    @Body('characterName') characterName: string,
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
      await this.chatRoomService.createMultipleChat(
        characterId,
        file,
        characterName,
      );

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

  @UseGuards(CommonJwtGuard)
  @Post('set-nickname/:characterId')
  @HttpCode(201)
  async setNickname(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @Body('nickname') nickname: string,
  ) {
    const user = req.user as UserDocument;
    const chatRoomData = user.chatRoomDatas.get(characterId);
    chatRoomData.nickname = nickname;
    user.chatRoomDatas.set(characterId, chatRoomData);
    await user.save();
    return { nickname };
  }

  @UseGuards(CommonJwtGuard)
  @Get('user-nickname/:characterId')
  @HttpCode(200)
  async getChatRoomNickname(
    @Req() req: Request,
    @Param('characterId') characterId: string,
  ) {
    const user = req.user as UserDocument;
    const chatRoomData = user.chatRoomDatas.get(characterId);

    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;
    return {
      nickname: nickname,
      isChatRoomSpecific: !!chatRoomData.nickname,
    };
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(LastAccessInterceptor)
  @Post('user-reply/:characterId')
  @HttpCode(201)
  async addUserReply(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @Body() userReplyDTO: UserReplyDTO,
  ) {
    const user = req.user as UserDocument;

    if (
      !user.subscribedCharacters.includes(
        new Types.ObjectId(userReplyDTO.characterId),
      )
    ) {
      throw new HttpException('user not subscribed to character', 400);
    }
    await this.chatRoomService.addUserReply(user._id, userReplyDTO);
    return { msg: 'reply added' };
  }

  @UseGuards(CommonJwtGuard)
  @Post('image-reply/:characterId')
  @UseInterceptors(FileInterceptor('image'))
  @UseInterceptors(LastAccessInterceptor)
  @HttpCode(201)
  async addImageReply(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const user = req.user as UserDocument;
    if (!user.subscribedCharacters.includes(new Types.ObjectId(characterId))) {
      throw new HttpException('user not subscribed to character', 400);
    }
    if (!image) {
      winstonLogger.error('no image provided');
      throw new HttpException('no image provided', 400);
    }

    const imageUrl = await this.chatRoomService.addImageReply(
      user._id,
      image,
      characterId,
    );

    return { msg: 'image reply added', imageUrl };
  }

  // //this is for forcing server to refresh the chat cache for sending chats
  // //this should only be used for debugging purpose
  // @UseGuards(CommonJwtGuard)
  // @Post('force-refresh')
  // @HttpCode(200)
  // async forceRefreshChatCaching(@Req() req: Request) {
  //   const user = req.user as UserDocument;
  //   if (user.role !== 'admin') {
  //     throw new UnauthorizedException('Unauthorizzed access');
  //   }

  //   const todayChatLogs =
  //     await this.chatRoomService.flushAndRetreieveChatLogToCache();
  //   return todayChatLogs;
  // }
  // this is for forcing server to check whether there are chats to send
  // this should only be used for debugging purpose
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
