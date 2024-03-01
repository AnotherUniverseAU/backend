import {
  Controller,
  Get,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
