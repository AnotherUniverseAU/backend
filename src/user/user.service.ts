import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { UserRepository } from 'src/repository/user.repository';
import { userDataDTO } from './dto/userData.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { Types } from 'mongoose';
import { CharacterChat } from 'src/schemas/chat-schema/character-chat.schema';
import { FirebaseService } from 'src/firebase/firebase.service';
import nicknameModifier from '../global/nickname-modifier';
import { CancelReasonRepository } from 'src/repository/cancel-reason.repository';
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
    const user = await this.userRepo.addSubscription(payload);

    console.log(
      'user domain, added character:',
      payload.characterId,
      'to: ',
      payload.userId,
    );
  }

  @OnEvent('broadcast')
  async sendUserChatNotification(payload: CharacterChat) {
    // find by subscribed character
    const allUsers = await this.userRepo.findBySubscribedCharacter(
      payload.characterId,
    );
    const characterId = payload.characterId.toString();
    const characterName = payload.characterName;
    const characterChat = payload.content;
    console.log(allUsers);
    await Promise.all(
      allUsers.map(async (user) => {
        if (!user.chatRoomDatas.get(characterId)) return;

        const fcmToken = user.fcmToken;
        const chatRoomData = user.chatRoomDatas.get(characterId);
        //if user have set the specific nickname, use it else, default nickname
        const nickname = chatRoomData.nickname
          ? chatRoomData.nickname
          : user.nickname;

        const userSpecificChat = characterChat.map((chat) => {
          return nicknameModifier(nickname, chat);
        });
        const title = `${characterName}님이 새로운 채팅을 보냈어요`;
        const body = userSpecificChat;
        console.log(title, body);
        await this.firebaseService.sendUserNotification(title, body, fcmToken);

        //update chatRoom lastchat
        chatRoomData.lastChat = userSpecificChat[userSpecificChat.length - 1];
        chatRoomData.unreadCounts += userSpecificChat.length;
        user.chatRoomDatas.set(characterId, chatRoomData);
        await user.save();
      }),
    );
  }
}
