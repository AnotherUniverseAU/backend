import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { UserRepository } from 'src/repository/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { userDataDTO } from './dto/userData.dto';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}
  getUserInfo(user: UserDocument): userDataDTO {
    return new userDataDTO(user);
  }

  async setLiamChar() {
    const charId = '65c0b542c9a646697bb644aa';
    const userId = '65bcb2592c47f2f5ee0d464e';
    const user = await this.userRepo.findById(userId);

    user.subscribedCharacters = [new Types.ObjectId(charId)];
    await user.save();
    console.log(user);
    return user;
  }
}
