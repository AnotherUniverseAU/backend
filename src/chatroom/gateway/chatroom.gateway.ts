import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatCache } from 'src/schemas/chat-schema/chat-cache.schema';
import { ChatGatewayService } from './chat-gateway.service';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { UserReplyDTO } from '../dto/user-reply.dto';
import { plainToInstance } from 'class-transformer';
import { ImageReplyDTO } from '../dto/image-reply.dto';

@WebSocketGateway({
  namespace: 'socket/chat',
  cors: true,
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private chatGatewayService: ChatGatewayService) {}

  private clientConnectionCheck = new Map<string, NodeJS.Timeout>();
  private clientSocketMap = new Map<string, string>();
  private chatDataMap = new Map<string, ChatCache>();

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
    //open ping for refreshing
    client.on('ping', () => {
      console.log('refreshing connection check with: ', client.data.userId);
      clearTimeout(this.clientConnectionCheck.get(client.id));

      const timeout =
        this.chatGatewayService.createDisconnectionTimeout(client);
      this.clientConnectionCheck.set(client.id, timeout);

      client.emit('pong', 'refreshed');
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
    console.log('gatway domain broadcasting chat: ', payload);

    const oldChatData = this.chatDataMap.get(
      payload.chatLog.characterId.toString(),
    );
    if (oldChatData) {
      console.log('refreshing chatDataMap');
      this.chatGatewayService.updateChatDataMap(oldChatData);
    }
    console.log('update chatDataMap to new chat');
    this.chatDataMap.set(payload.chatLog.characterId.toString(), payload);

    this.server.to(payload.chatLog.characterId.toString()).emit('message', {
      characterId: payload.chatLog.characterId,
      content: payload.chatLog.content,
      imgUrl: payload.chatLog.imgUrl,
      timeToSend: payload.chatLog.timeToSend,
    });
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

  @SubscribeMessage('user-reply')
  async handleReply(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UserReplyDTO,
  ) {
    const userId = client.data.userId as string;
    const chatData = this.chatDataMap.get(payload.characterId);
    const content = chatData ? chatData.chatLog.content : [];
    //save to cache
    await this.chatGatewayService.handleUserReply(userId, payload, content);

    client.emit('message', 'reply saved');
  }

  @SubscribeMessage('image-reply')
  async handImageReply(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ImageReplyDTO,
  ) {
    console.log('payload: ', payload);
    const userId = client.data.userId as string;
    const chatData = this.chatDataMap.get(payload.characterId);
    const content = chatData ? chatData.chatLog.content : [];
    const result = await this.chatGatewayService.handleImageReply(
      userId,
      payload,
      content,
    );

    if (result) {
      client.emit('message', 'image reply saved');
    }
  }

  private getSocket(socketId: string) {
    const socket = (this.server as any).sockets.get(socketId);
    // const socket = this.server.sockets.get(socketId);
    return socket;
  }
}
