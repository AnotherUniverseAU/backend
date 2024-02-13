import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from 'src/repository/user.repository';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CommonJwtStrategy extends PassportStrategy(
  Strategy,
  'common-jwt',
) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    const id = payload.sub;
    const user = await this.userRepository.findById(id);
    return user;
  }
}
