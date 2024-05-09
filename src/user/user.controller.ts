import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Param,
  HttpException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { UserService } from './user.service';
import { Request } from 'express';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(CommonJwtGuard)
  @Get('info')
  getUserInfo(@Req() req: Request) {
    const user = req.user as UserDocument;
    const userInfo = this.userService.getUserInfo(user);
    return userInfo;
  }

  @UseGuards(CommonJwtGuard)
  @Get('nickname')
  @HttpCode(200)
  getUserNickname(@Req() req: Request) {
    const user = req.user as UserDocument;
    console.log(user);
    return { nickname: user.nickname };
  }

  @UseGuards(CommonJwtGuard)
  @Post('nickname')
  @HttpCode(200)
  async setUserNickname(
    @Req() req: Request,
    @Body('nickname') nickname: string,
  ) {
    const user = req.user as UserDocument;

    // chatRoomdatas > chatRoomdata마다
    user.chatRoomDatas.forEach((chatRoom) => {
      // 해당 방 닉네임이 user.nickname과 같다면 (= set-nickname 하지 않은 닉네임)
      if (chatRoom.nickname === user.nickname) {
        chatRoom.nickname = nickname;
      }
    });

    user.nickname = nickname;
    await user.save();
    return this.userService.getUserInfo(user);
  }

  @UseGuards(CommonJwtGuard)
  @Post('fcm-token')
  @HttpCode(200)
  async setFcmToken(@Req() req: Request, @Body('fcmToken') fcmToken: string) {
    const user = req.user as UserDocument;
    user.fcmToken = fcmToken;
    await user.save();
    return fcmToken;
  }

  @UseGuards(CommonJwtGuard)
  @Post('withdraw')
  @HttpCode(200)
  async deleteUser(
    @Req() req: Request,
    @Body('cancelType') cancelType: number,
    @Body('reason') reason: string,
    @Body('nickname') nickname: string,
  ) {
    const user = req.user as UserDocument;
    // 올바른 페이지에서 보낸 것 확인 => abuse 방지
    if (nickname === user.nickname) {
      await this.userService.deleteUser(user, cancelType, reason);
      return { msg: 'deleted' };
    } else {
      throw new HttpException(
        'given nickname does not match with user nickname',
        400,
      );
    }
  }

  @UseGuards(CommonJwtGuard)
  @Post('force-broadcast')
  @HttpCode(200)
  async forceBroadcastChat(@Req() req: Request, @Body('chat') chats: any) {
    const user = req.user as UserDocument;
    if (user.role != 'admin') return { msg: 'not admin' };

    const chat = new CharacterChat(chats);
    console.log('controller', chat);
    const type = 'chat';
    this.userService.sendUserChatNotification(chat, type);
  }

  @UseGuards(CommonJwtGuard)
  @Get('reject-ids')
  @HttpCode(200)
  getUserRejectedIds(@Req() req: Request) {
    const user = req.user as UserDocument;
    return { rejectedIds: user.rejectedIds };
  }
  @UseGuards(CommonJwtGuard)
  @Get('check-admin')
  @HttpCode(200)
  getUserAdmin(@Req() req: Request) {
    const user = req.user as UserDocument;

    return { isAdmin: user.role === 'admin' };
  }

  @UseGuards(CommonJwtGuard)
  @Post('send-marketing-message')
  @HttpCode(200)
  async sendMarkettingMessage(
    @Req() req: Request,
    @Query('queries') queries: string,
  ) {
    const user = req.user as UserDocument;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Unauthorizzed access');
    }

    const users = this.userService.getUserByQueries(queries);
    return users;
  }
}
