import { Module } from '@nestjs/common';
import { FirebsaeController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [FirebsaeController],
  providers: [FirebaseService],
  exports: [FirebaseService],
  imports: [AuthModule],
})
export class FirebaseModule {}
