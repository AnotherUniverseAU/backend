import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { winstonLogger } from './winston.util';

@Injectable()
export class LoggerSchedulerService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  constructor(private configService: ConfigService) {
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_CONTAINER_NAME',
    );
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
  }

  @Cron('1 0 * * *')
  async uploadCache() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLog = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate}`;
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

    await infoBlobClient.upload(InfoBuffer, InfoBuffer.length);

    const warningBlobClient = containerClient.getBlockBlobClient(
      `logs/${yesterdayWarningLog}`,
    );

    await warningBlobClient.upload(WarningBuffer, WarningBuffer.length);

    winstonLogger.log('uploaded cache logs');
  }
}
