import { Module } from '@nestjs/common';
import { FirebsaeController } from './firebase.controller';
import { FirebaseService } from './firebase.service';

@Module({
  controllers: [FirebsaeController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
