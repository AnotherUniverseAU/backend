import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { IUesrRepository } from './user.repository.interface';
import { OauthDTO } from 'src/oauth/dto/oauth.dto';
import { OauthUserDTO } from 'src/oauth/dto/oauth-user.dto';

@Injectable()
export class UserRepository implements IUesrRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
    });
    return await user.save();
  }

  async createByVanilla(): Promise<UserDocument> {
    const user = new this.userModel({
      _id: new Types.ObjectId(),
    });
    return await user.save();
  }

  async findByUserId(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ userId: userId });
    return user;
  }
}
