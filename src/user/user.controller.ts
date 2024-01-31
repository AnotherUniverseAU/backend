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
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserService } from './user.service';
import { SignupGuard } from 'src/auth/signup.guard';
import { Request, Response } from 'express';
import { SignupDTO } from './dto/signup.dto';
import { json } from 'stream/consumers';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('check-userid-duplicate/:id')
  async checkIdDuplicate(@Param('id') userId: string, @Res() res: Response) {
    const user = await this.userService.checkIdDuplicate(userId);
    if (user)
      return res.status(409).json({ status: 409, messgae: 'duplicate id' });
    else return res.status(200).json({ status: 200, message: 'unique id' });
  }

  @UseGuards(SignupGuard)
  @Post('verify-phone-num')
  @HttpCode(200)
  async verifyPhoneNum(
    @Req() req: Request,
    @Body('phoneNum') phoneNum: string,
  ) {
    let user = req.user as UserDocument;

    //check duplicate and send verification code
    await this.userService.verifyUserPhoneNum(user, phoneNum);
    const token = await this.authService.signToken('signup', { sub: user._id });
    return { token: token, message: 'code sent' };
  }

  @UseGuards(SignupGuard)
  @Post('confirm-phone-num')
  @HttpCode(200)
  async confirmPhoneNum(
    @Req() req: Request,
    @Body('code') code: string,
    @Body('phoneNum') phoneNum: string,
  ) {
    const user = req.user as UserDocument;
    const confimation = await this.userService.confirmUserPhoneNum(
      user,
      phoneNum,
      code,
    );
    if (confimation) {
      return { message: 'phoneNum confirmed' };
    }
  }

  @UseGuards(SignupGuard)
  @Post('signup')
  @HttpCode(200)
  async signup(@Req() req: Request, @Body() body: SignupDTO) {
    const user = req.user as UserDocument;
  }
}
