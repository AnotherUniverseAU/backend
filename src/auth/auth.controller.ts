import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CommonJwtGuard } from './common-jwt.guard';
import { Request } from 'express';
import { UserRepository } from 'src/repository/user.repository';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('new-access-token')
  @HttpCode(200)
  async getNewToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('invalid header format');
    }
    const token = authHeader.split(' ')[1];
    const payload = await this.authService.verifyToken('refresh', token);
    const new_payload = { sub: payload.sub };
    const access_token = await this.authService.signToken(
      'access',
      new_payload,
    );
    return { access_token: access_token };
  }
}
