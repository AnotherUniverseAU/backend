import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { IOauthRepository } from './oauth.repository.interface';

@Injectable()
export class OauthRepository implements IOauthRepository {
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
}
