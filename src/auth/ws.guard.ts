import { CanActivate, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { WsException } from '@nestjs/websockets';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake?.query?.auth_token as string;

    try {
      const payload = await this.authService.verifyToken('access', token);
      client.data.userId = payload.sub;
      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
