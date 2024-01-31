import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SmsService {
  private COOL_SMS_API_KEY: string;
  private COOL_SMS_API_SECRET: string;
  private FROM_PHONE_NUM: string;
  constructor(private configService: ConfigService) {
    this.COOL_SMS_API_KEY = configService.get<string>('COOL_SMS_API_KEY');
    this.COOL_SMS_API_SECRET = configService.get<string>('COOL_SMS_API_SECRET');
    this.FROM_PHONE_NUM = configService.get<string>('FROM_PHONE_NUM');
  }
}
