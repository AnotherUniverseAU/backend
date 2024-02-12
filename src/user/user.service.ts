import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { UserRepository } from 'src/repository/user.repository';
import { userDataDTO } from './dto/userData.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}
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

  @OnEvent('subscribe-user')
  async subscribeUser(payload: SubscriptionEventDTO) {
    const user = await this.userRepo.addSubscribedCharacter(payload);
    console.log(
      'user domain, added character:',
      payload.characterId,
      'to: ',
      payload.userId,
    );
  }
}
