import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { winstonLogger } from './winston.util';
import winston from 'winston/lib/winston/config';

@Injectable()
export class LoggerSchedulerService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  constructor(private configService: ConfigService) {
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_LOG_CONTAINER_NAME',
    );
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }

  @Cron('1 0 * * *')
  async uploadCache() {
    winstonLogger.log('uploading cache logs to azure');
    const yesterday = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const yesterdayLog = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    const yesterdayInfoLog = yesterdayLog + '.info.log';
    const yesterdayInfoLogDir = path.join(
      process.cwd(),
      'logs',
      yesterdayInfoLog,
    );
    const yesterdayWarningLog = yesterdayLog + '.warn.log';
    const yesterdayWarningLogDir = path.join(
      process.cwd(),
      'logs',
      yesterdayWarningLog,
    );

    const readFile = util.promisify(fs.readFile);
    const InfoBuffer = await readFile(yesterdayInfoLogDir);
    const WarningBuffer = await readFile(yesterdayWarningLogDir);

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const infoBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayInfoLog}`,
    );

    winstonLogger.log(this.containerName);

    const result = await infoBlobClient.upload(InfoBuffer, InfoBuffer.length);
    winstonLogger.log({ url: infoBlobClient.url });

    const warningBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayWarningLog}`,
    );

    await warningBlobClient.upload(WarningBuffer, WarningBuffer.length);

    winstonLogger.log('uploaded cache logs');
  }
}
