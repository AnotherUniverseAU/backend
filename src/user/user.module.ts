import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserRepository } from 'src/repository/user.repository';
import { JwtModule } from '@nestjs/jwt';
import {
  CancelReason,
  CancelReasonSchema,
} from 'src/schemas/cancel-reason.schema';
import { CancelReasonRepository } from 'src/repository/cancel-reason.repository';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    JwtModule,
    AuthModule,
    FirebaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CancelReason.name, schema: CancelReasonSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, CancelReasonRepository],
})
export class UserModule {}
