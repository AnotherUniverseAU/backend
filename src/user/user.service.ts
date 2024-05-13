import { HttpException, Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserRepository } from 'src/repository/user.repository';
import { userDataDTO } from './dto/userData.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { Types } from 'mongoose';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { FirebaseService } from 'src/firebase/firebase.service';
import nicknameModifier from '../global/nickname-modifier';
import { CancelReasonRepository } from 'src/repository/cancel-reason.repository';
import { ReplyEventDto } from 'src/global/dto/reply-event.dto';
import { winstonLogger } from 'src/common/logger/winston.util';
import { ChatRoomData } from './dto/domain/chatroom';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private firebaseService: FirebaseService,
    private cancelRepo: CancelReasonRepository,
  ) {}

  getUserInfo(user: UserDocument): userDataDTO {
    return new userDataDTO(user);
  }

  @OnEvent('unsubscribe-user')
  async unsubScribeUser(payload: SubscriptionEventDTO) {
    const updatedUser =
      await this.userRepo.removeUnsubscribedCharacters(payload);
    console.log(
      `unsubscribed ${payload.characterId} from user: ${payload.userId}`,
    );
    console.log(updatedUser);
  }

  async deleteUser(user: UserDocument, cancelType: number, reason: string) {
    await user.deleteOne();
    await this.cancelRepo.create(cancelType, reason);
  }

  @OnEvent('subscribe-user')
  async subscribeUser(payload: SubscriptionEventDTO) {
    let user: User;

    user = await this.userRepo.findById(payload.userId);

    if (
      user.subscribedCharacters.includes(
        new Types.ObjectId(payload.characterId),
      )
    ) {
      console.log(
        'user already subscribed to this character',
        payload.userId,
        payload.characterId,
      );
      return;
    }
    user = await this.userRepo.addSubscription(user.nickname, payload);

    console.log(
      'user domain, added character:',
      payload.characterId,
      'to: ',
      payload.userId,
    );
  }

  // @OnEvent('reply-broadcast')
  // async sendUserReplyNotification(payload: CharacterChat) {
  //   const { user, content } = payload;

  //   const reply = characterChat.reply;

  //   const userSpecificChat = reply.map((chat) => {
  //     return nicknameModifier(user.nickname, chat);
  //   });
  //   const characterName = characterChat.characterName;
  //   const title = characterName;
  //   const body = userSpecificChat[0];
  //   const characterId = characterChat.characterId.toString();
  //   const fcmToken = user.fcmToken;

  //   console.log(
  //     'sending reply notification',
  //     title,
  //     body,
  //     user._id,
  //     characterId,
  //   );

  //   await this.firebaseService.sendUserNotification(
  //     user._id.toString(),
  //     title,
  //     body,
  //     fcmToken,
  //     characterId,
  //   );
  // }

  @OnEvent('broadcast')
  async sendUserChatNotification(payload: CharacterChat, type: string) {
    // find by subscribed character
    const allUsers = await this.userRepo.findBySubscribedCharacter(
      payload.characterId,
    );
    const characterId = payload.characterId.toString();
    const { characterName, content, reply, timeToSend } = payload;
    await Promise.all(
      allUsers.map(async (user) => {
        let isUserActive: boolean;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (user.lastAccess < yesterday) isUserActive = false;
        else isUserActive = true;

        // 휴면 유저라면 return
        if (!isUserActive) {
          winstonLogger.log(
            `휴면 계정입니다. : ${user._id}, 마지막 접속 : ${user.lastAccess}`,
          );
          return;
          // 캐릭터 구독하지 않은 유저 promise 종료
        } else if (!user.chatRoomDatas.get(characterId)) {
          winstonLogger.warn(
            `캐릭터 구독을 하지 않아 보내지 못했습니다 : ${user._id}`,
          );
          return;
          // fcm 토큰 없는 유저 promise 종료
        } else if (!user.fcmToken) {
          winstonLogger.error(
            `fcm토큰이 없어 메시지를 보내지 못했습니다 : ${user._id}`,
          );
          return;
        }

        const fcmToken = user.fcmToken;

        const chatRoomData = user.chatRoomDatas.get(characterId);
        // 답장 이후에 들어온 유저에게는 답답장 발신 안해주기
        if (chatRoomData.createdDate > timeToSend) {
          winstonLogger.log(
            `유저 구독 시간이 해당 채팅보다 늦어 발신하지 않습니다 : ${user._id}`,
          );
          return;
        }
        //if user have set the specific nickname, use it else, default nickname
        const nickname = chatRoomData.nickname
          ? chatRoomData.nickname
          : user.nickname;

        // type(chat, reply)에 따른 fcm 알림 내용 설정
        let textListToSend: string[];
        if (type === 'chat') textListToSend = content;
        else textListToSend = reply;

        const userSpecificChat = textListToSend.map((chat) => {
          if (chat.includes('https://')) return '캐릭터가 사진을 보냈습니다';
          else {
            const modifiedChat = nicknameModifier(nickname, chat);
            return modifiedChat;
          }
        });
        const title = characterName;
        const body = userSpecificChat[0];

        //update chatRoom lastchat
        chatRoomData.lastChat = userSpecificChat[userSpecificChat.length - 1];
        chatRoomData.unreadCounts += userSpecificChat.length;
        chatRoomData.lastChatDate =
          type === 'chat'
            ? timeToSend
            : new Date(Number(timeToSend) + 30 * 60 * 1000);
        user.chatRoomDatas.set(characterId, chatRoomData);
        await user.save();

        await this.firebaseService.sendUserNotification(
          user._id.toString(),
          title,
          body,
          fcmToken,
          chatRoomData.characterId.toString(),
        );
      }),
    );
  }

  @OnEvent('reject-character')
  async addUserRejectedIds(userId: Types.ObjectId, characterId: string) {
    const user = await this.userRepo.findById(String(userId));
    if (user.rejectedIds.includes(new Types.ObjectId(characterId))) {
      winstonLogger.error(
        `[reject-character] ${user._id} user>rejectedIds already contain ${characterId}`,
      );
      throw new HttpException('character alreay rejected', 400);
    }
    user.rejectedIds.push(new Types.ObjectId(characterId));
    await user.save();

    winstonLogger.log(
      `[reject-character] ${user._id} user>rejectedIds updated`,
    );
  }

  async getUserByQueries(queries: string) {
    const users = await this.userRepo.findUsersByQuery(queries);
    return users;
  }

  async setChatRoomData(
    userId: Types.ObjectId,
    characterId: Types.ObjectId,
    chatRoomData: ChatRoomData,
  ) {
    const user = await this.userRepo.findById(String(userId));
    await this.userRepo.setChatRoomData(user, characterId, chatRoomData);
    await user.save();
  }

  async getChatRoomData(userId: Types.ObjectId, characterId: Types.ObjectId) {}
}
