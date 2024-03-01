import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { LoginCredentialDTO } from '../dto/login-credential.dto';
import { OauthUserDTO } from '../dto/oauth-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OauthDTO } from '../dto/oauth.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CommonOauthService {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository,
  ) {}

  async findOrCreate(mode: string, userInfo: OauthDTO): Promise<UserDocument> {
    let user = await this.userRepository.findByOauth(mode, userInfo.id);

    if (!user) {
      console.log('user not found');
      user = await this.userRepository.createByOauth(mode, userInfo);
      console.log('user created');
    }

    return user;
  }

  async getUserCredentials(user: User): Promise<LoginCredentialDTO> {
    const payload = { sub: user._id.toString() };

    const access_token = await this.authService.signToken('access', payload);
    const refresh_token = await this.authService.signToken('refresh', payload);

    return new LoginCredentialDTO(access_token, refresh_token);
  }

  async getSignupToken(user: User): Promise<string> {
    const payload = { sub: user._id.toString() };
    const signUpToken = await this.authService.signToken('signup', payload);

    return signUpToken;
  }
}
