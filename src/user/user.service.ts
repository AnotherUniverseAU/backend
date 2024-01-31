import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { SignupDTO } from './dto/signup.dto';
import { UserRepository } from 'src/repository/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  private COOL_SMS_API_KEY: string;
  private COOL_SMS_API_SECRET: string;
  private messageService: any;
  private FROM_PHONE_NUM: string;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private userRepo: UserRepository,
    private authService: AuthService,
  ) {
    this.COOL_SMS_API_KEY = configService.get<string>('COOL_SMS_API_KEY');
    this.COOL_SMS_API_SECRET = configService.get<string>('COOL_SMS_API_SECRET');
    this.messageService = new CoolsmsMessageService(
      this.COOL_SMS_API_KEY,
      this.COOL_SMS_API_SECRET,
    );
    this.FROM_PHONE_NUM = configService.get<string>('FROM_PHONE_NUM');
  }

  async verifyUserPhoneNum(user: UserDocument, phoneNum: string) {
    if (!user) {
      user = await this.userRepo.createByVanilla();
    }
    //check for duplicates
    const duplicate = await this.userModel.findOne({ phoneNum: phoneNum });
    if (duplicate) {
      if (!user.oauthAccounts) {
        await user.deleteOne();
      }
      throw new Error('duplicate phoneNum');
    }

    //send text
    try {
      await this.sendVerificationText(user, phoneNum);
    } catch (err) {
      if (!user.oauthAccounts) {
        await user.deleteOne();
        throw new Error('error while sending message');
      } else {
        user.verificationCode = null;
      }
    }
  }

  async sendVerificationText(user: UserDocument, phoneNum: string) {
    const verificationCode = Math.floor(
      Math.random() * (999999 - 100000 + 1) + 100000,
    ).toString();

    await this.messageService
      .sendOne({
        to: phoneNum,
        from: this.FROM_PHONE_NUM,
        text: `AU 인증을 위해 다음 인증번호를 입력해주시기 바랍니다. [${verificationCode}]`,
      })
      .then((res) => console.log(res))
      .then(async () => {
        user.verificationCode = verificationCode;
        await user.save();
      });

    console.log('message sent with code' + user.verificationCode);
  }

  async checkIdDuplicate(userId: string) {
    const user = await this.userRepo.findByUserId(userId);
    return user;
  }

  async confirmUserPhoneNum(
    user: UserDocument,
    phoneNum: string,
    code: string,
  ): Promise<boolean> {
    if (user.verificationCode == code) {
      user.verified = true;
      user.phoneNum = phoneNum;
      await user.save();
      return true;
    } else {
      throw new UnauthorizedException('verification code not same');
    }
  }

  async signup(user: UserDocument, userData: SignupDTO) {
    if (user.verificationCode != userData.verificationCode) {
      throw new UnauthorizedException('verification code not same');
    }
    user.age = parseInt(userData.age);
    user.userId = userData.userId;
  }
}
