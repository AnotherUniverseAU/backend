import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatCache } from 'src/schemas/chat-cache.schema';
import { ChatGatewayService } from './chat-gateway.service';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';

@WebSocketGateway({
  namespace: 'socket/chat',
  cors: true,
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private chatGatewayService: ChatGatewayService) {}

  private clientConnectionCheck = new Map<string, NodeJS.Timeout>();
  private clientSocketMap = new Map<string, string>();

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    const token = client.handshake?.query?.access_token as string;
    const result = await this.chatGatewayService.verifyUser(client, token);
    //cut the user if not verified
    if (!result.verified) {
      client.emit('message', result.message);
      client.disconnect(true);
      return;
    }

    //check if another socket already in place
    const oldSocketId = this.clientSocketMap.get(client.data.userId);
    const oldSocket = this.getSocket(oldSocketId);
    if (oldSocket) {
      console.log('removing old socket from user', client.data.userId);
      this.chatGatewayService.disconnectUser(
        oldSocket,
        this.clientConnectionCheck,
        this.clientSocketMap,
      );
    }
    console.log('adding user to client socket map');
    //add client to socketMap
    this.clientSocketMap.set(client.data.userId, client.id);
    console.log('adding user to character rooms');
    //handle adding to rooms
    await this.chatGatewayService.addSocketToRooms(client);
    //initiate disconnection sequence
    console.log('queueing disconnection');
    const timeout = this.chatGatewayService.createDisconnectionTimeout(client);
    this.clientConnectionCheck.set(client.id, timeout);
    //open pong for refreshing
    client.on('pong', () => {
      console.log('refreshing connection check with: ', client.data.userId);
      clearTimeout(this.clientConnectionCheck.get(client.id));

      const timeout =
        this.chatGatewayService.createDisconnectionTimeout(client);
      this.clientConnectionCheck.set(client.id, timeout);
    });

    client.emit('message', 'hello from server');
    console.log(
      'clientConnection',
      this.clientConnectionCheck,
      'map',
      this.clientSocketMap,
    );
  }

  @OnEvent('broadcast')
  boardcastMessage(payload: ChatCache): any {
    console.log('sending chat: ', payload);

    this.server.to(payload.characterId.toString()).emit('message', payload);
  }

  @OnEvent('unsubscribe-user')
  async unsubscribeUser(payload: SubscriptionEventDTO) {
    const socketId = this.clientSocketMap.get(payload.userId);
    const client = this.getSocket(socketId);

    await client.leave(payload.characterId);

    console.log(
      'removed subscription: ',
      payload.characterId,
      ' from user: ',
      payload.userId,
    );
  }

  @OnEvent('subscribe-user')
  async subScribeUser(payload: SubscriptionEventDTO): Promise<any> {
    console.log('chatroom domain');
    const socketId = this.clientSocketMap.get(payload.userId);
    console.log('retrieving user from socket server');
    const client = this.getSocket(socketId);
    if (client) {
      client.join(payload.characterId);
      console.log(
        'chatroom gateway domain, added character:',
        payload.characterId,
        'to: ',
        payload.userId,
      );
    } else {
      console.log('unable to find user: ', payload.userId);
    }
  }

  @OnEvent('disconnect-user')
  async disconnectUser(payload: any) {
    const client = this.getSocket(payload.socketId);
    if (!client) {
      //already been erased
      return;
    }
    this.chatGatewayService.disconnectUser(
      client,
      this.clientConnectionCheck,
      this.clientSocketMap,
    );
  }

  @SubscribeMessage('reply')
  handleReply(@ConnectedSocket() client: Socket, payload: any) {}

  private getSocket(socketId: string) {
    const socket = (this.server as any).sockets.get(socketId);
    // const socket = this.server.sockets.get(socketId);
    return socket;
  }
}
