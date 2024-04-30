import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Param,
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
  @Post('delete-user')
  @HttpCode(200)
  async deleteUser(
    @Req() req: Request,
    @Body('cancelType') cancelType: number,
    @Body('reason') reason: string,
  ) {
    const user = req.user as UserDocument;
    await this.userService.deleteUser(user, cancelType, reason);
    return { msg: 'deleted' };
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
}
