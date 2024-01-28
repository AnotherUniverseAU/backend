import { Injectable } from '@nestjs/common';
import { OauthRepository } from '../repository/oauth.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
import { LoginCredentialDTO } from '../dto/login-credential.dto';
import { NewUserDTO } from '../dto/new-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonOauthService {
  private accessSecret: string;
  private refreshSecret: string;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private oauthRepository: OauthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    this.refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
  }

  async findOrCreate(mode: string, id: string): Promise<NewUserDTO> {
    let user = await this.oauthRepository.findByOauth(mode, id);

    if (!user) {
      console.log('user not found');
      console.log(id);
      user = new this.userModel({
        _id: new Types.ObjectId(),
        oauthAccounts: [{ provider: mode, id: id }],
      });
      await user.save();
      console.log('user created');
      return new NewUserDTO(true, user);
    }

    if (user && user.phoneNum) {
      return new NewUserDTO(false, user);
    }

    return new NewUserDTO(true, user);
  }

  async getUserCredentials(user: User): Promise<LoginCredentialDTO> {
    const payload = { sub: user._id };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: '1h',
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: '30d',
    });

    return new LoginCredentialDTO(access_token, refresh_token);
  }
}
