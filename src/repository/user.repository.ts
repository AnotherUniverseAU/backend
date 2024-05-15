import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { OauthDTO } from 'src/oauth/dto/oauth.dto';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';
import { ChatRoomData } from 'src/user/dto/domain/chatroom';
import { User as UserDomain } from 'src/user/dto/domain/user';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<UserDocument[]> {
    const users = await this.userModel.find();
    return users;
  }

  async findBySubscribedCharacter(
    characterId: Types.ObjectId,
  ): Promise<Partial<UserDocument[]>> {
    const users = await this.userModel
      .find({
        subscribedCharacters: { $in: [new Types.ObjectId(characterId)] },
      })
      .exec();
    return users;
  }

  async findByOauth(mode: string, id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      'oauthAccounts.provider': mode,
      'oauthAccounts.id': id,
    });
    return user;
  }
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async createByOauth(mode: string, userInfo: OauthDTO): Promise<UserDocument> {
    const user = new this.userModel({
      _id: new Types.ObjectId(),
      oauthAccounts: [{ provider: mode, id: userInfo.id }],
      nickname: userInfo.nickname,
      // email: userInfo.email,
      // phoneNum: userInfo.phoneNum,
      // gender: userInfo.gender,
      // age: userInfo.age,
    });
    await user.save();
    return user;
  }

  async addSubscription(nickname: string, payload: SubscriptionEventDTO) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        payload.userId,
        {
          $push: {
            subscribedCharacters: new Types.ObjectId(payload.characterId),
            subscriptionIds: new Types.ObjectId(payload.subscriptionId),
          },
          $set: {
            [`chatRoomDatas.${payload.characterId}`]: {
              characterId: new Types.ObjectId(payload.characterId),
              nickname: nickname,
            },
          },
        },
        { new: true },
      )
      .exec();
    return updatedUser;
  }

  async removeUnsubscribedCharacters(
    payload: SubscriptionEventDTO,
  ): Promise<User> {
    // Find the user and update in one step using MongoDB's $pull operator
    console.log('unsubscription payload', payload);
    const pullPayload = {};
    if (payload.subscriptionId) {
      pullPayload[`subscriptionIds`] = new Types.ObjectId(
        payload.subscriptionId,
      );
    }
    if (payload.characterId) {
      pullPayload[`subscribedCharacters`] = new Types.ObjectId(
        payload.characterId,
      );
    }

    console.log('pullPayload', pullPayload);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        new Types.ObjectId(payload.userId),
        {
          $pull: pullPayload,
          $unset: {
            [`chatRoomDatas.${payload.characterId}`]: '',
          },
        },
        { new: true }, // Return the updated document
      )
      .exec();

    return updatedUser;
  }

  async findUsersByQuery(queries: string): Promise<UserDocument[]> {
    const query = JSON.parse(queries);
    const users = await this.userModel.find(query);
    return users;
  }

  async setChatRoomData(
    user: UserDocument,
    characterId: Types.ObjectId,
    newChatRoomData: ChatRoomData,
  ) {
    const promises = Array.from(user.chatRoomDatas).map(
      async ([, chatRoomData]) =>
        chatRoomData.updateFromDomain(characterId, newChatRoomData),
    );
    await Promise.all(promises);
    await user.save();
  }
}
