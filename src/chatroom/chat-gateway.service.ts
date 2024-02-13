import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserRepository } from 'src/repository/user.repository';

@Injectable()
export class ChatGatewayService {
  constructor(
    private userRepo: UserRepository,
    private eventEmitter: EventEmitter2,
    private authService: AuthService,
  ) {}
  async verifyUser(
    client: Socket,
    token: string,
  ): Promise<{ verified: boolean; message: string }> {
    try {
      const payload = await this.authService.verifyToken('access', token);
      client.data.userId = payload.sub;
      return { verified: true, message: 'verification complete' };
    } catch (err) {
      return { verified: false, message: err };
    }
  }

  createDisconnectionTimeout(client: Socket) {
    //time out mark for 10min
    const timeout = setTimeout(() => {
      this.eventEmitter.emit('disconnect-user', { socketId: client.id });
    }, 600000);

    return timeout;
  }

  async addSocketToRooms(client: Socket) {
    const userId = client.data.userId;

    const user = await this.userRepo.findById(userId);
    const subscribedCharacters = user.subscribedCharacters;
    await Promise.all(
      subscribedCharacters.map((characterId) => {
        client.join(characterId.toString());
      }),
    );
    console.log(`user: ${user.nickname} joined to : ${subscribedCharacters}`);
  }

  disconnectUser(
    client: Socket,
    clientConnectionCheck: Map<string, NodeJS.Timeout>,
    clientSocketMap: Map<string, string>,
  ) {
    console.log('disconnecting: ', client.data.userId);
    client.emit('error', 'disconnecting due to no response');
    const userId = client.data.userId;
    clientConnectionCheck.delete(client.id);
    clientSocketMap.delete(userId);
    client.disconnect();
  }
}
