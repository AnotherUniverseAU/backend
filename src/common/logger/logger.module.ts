import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerController } from './logger.controller';
import { LoggerSchedulerService } from './logger-scheduler.service';

@Module({
  imports: [AuthModule],
  controllers: [LoggerController],
  providers: [LoggerSchedulerService],
})
export class LoggerModule {}
