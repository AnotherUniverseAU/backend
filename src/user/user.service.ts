import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { UserRepository } from 'src/repository/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { userDataDTO } from './dto/userData.dto';

@Injectable()
export class UserService {
  getUserInfo(user: UserDocument): userDataDTO {
    return new userDataDTO(user);
  }
}
