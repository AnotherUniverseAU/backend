import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Param,
  Res,
} from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}
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
}
