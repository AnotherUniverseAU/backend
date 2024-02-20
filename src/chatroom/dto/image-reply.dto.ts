import { IsDataURI, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ImageReplyDTO {
  @IsNotEmpty()
  imageBuffer: Buffer;

  @IsNotEmpty()
  @IsString()
  characterId: string;

  @IsDate()
  @IsNotEmpty()
  targetTimeToSend: Date;

  @IsNotEmpty()
  fileFormat: string;
}
