import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CommonJwtStrategy } from './common-jwt.strategy';
import { UserRepository } from 'src/repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { UserSchema } from 'src/schemas/user.schema';
import { SignupGuard } from './signup.guard';
import { CommonJwtGuard } from './common-jwt.guard';
import { AuthService } from './auth.service';
@Module({
  imports: [
    JwtModule,
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    CommonJwtGuard,
    CommonJwtStrategy,
    UserRepository,
    SignupGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
