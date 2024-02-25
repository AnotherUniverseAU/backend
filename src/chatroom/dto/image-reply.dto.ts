import {
  IsBoolean,
  IsDataURI,
  IsDate,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ImageReplyDTO {
  @IsNotEmpty()
  imageBuffer: Buffer;

  @IsNotEmpty()
  @IsString()
  characterId: string;

  @IsNotEmpty()
  fileFormat: string;

  @IsNotEmpty()
  @IsBoolean()
  isAfterCharacterReply: boolean;

  isNew: boolean;
}
