import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CharacterService } from './character.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { Request } from 'express';
import { UserDocument } from 'src/schemas/user.schema';
import { CharacterDTO } from './dto/character.dto';
import { Types } from 'mongoose';
import { CharacterCreationDTO } from './dto/character-creation.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Character } from 'src/schemas/character.schema';
import nicknameModifier from '../global/nickname-modifier';
import { winstonLogger } from 'src/common/logger/winston.util';

@Controller('character')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  //may work for fater guard => not finding the user just authenticating
  //also need paging
  @UseGuards(CommonJwtGuard)
  @Get('list')
  @HttpCode(200)
  async getCharacters() {
    const characters = await this.characterService.getAllCharacters();

    if (characters) {
      const shortCharacterDTOs = characters.map((character) => {
        return new CharacterDTO(character).toShort();
      });
      console.log(shortCharacterDTOs);
      return { characters: shortCharacterDTOs };
    } else {
      return { characters: [] };
    }
  }

  @UseGuards(CommonJwtGuard)
  @Get('main-character')
  @HttpCode(200)
  async getListMain() {
    const mainCharacter = await this.characterService.getMainCharacter();
    const characterDTO = new CharacterDTO(mainCharacter);
    return { mainCharacter: characterDTO.toShort() };
  }

  @UseGuards(CommonJwtGuard)
  @Get('info/bulk')
  @HttpCode(200)
  async getSubscribedCharacterInfo(@Req() req: Request) {
    const user = req.user as UserDocument;
    const characterDtos =
      await this.characterService.getSubscribedCharacterInfo(user);

    return { characters: characterDtos };
  }

  @UseGuards(CommonJwtGuard)
  @Get('info/:id')
  @HttpCode(200)
  async getCharcterInfo(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserDocument;
    let character: Character;
    try {
      character = await this.characterService.getCharacterInfo(id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
    if (character) {
      const characterDTO = new CharacterDTO(character);
      return { isNew: user.isNew, character: characterDTO };
    } else {
      throw new HttpException('no such character', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(CommonJwtGuard)
  @Get('hello/:id')
  @HttpCode(200)
  async getCharacterHello(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserDocument;
    if (!user.subscribedCharacters.includes(new Types.ObjectId(id))) {
      throw new HttpException('user not subscribed to character', 400);
    }
    // TODO: 이거 서비스 로직으로 내려야함

    const helloMessageSet = await this.characterService.getCharacterHello(id);
    const chatRoomData = user.chatRoomDatas.get(id);

    let helloMessage: string[];

    const subscriptionStartTimeLocal = chatRoomData.createdDate.getTime() + 9;
    if (subscriptionStartTimeLocal > 2 && subscriptionStartTimeLocal < 7)
      helloMessage = helloMessageSet.helloMessageNight;
    else helloMessage = helloMessageSet.helloMessageDay;

    //update chatRoomData => 마지막 채팅, 안 읽은 채팅 수, 마지막 채팅 시간

    if (!chatRoomData.lastChatDate) {
      chatRoomData.lastChatDate = new Date();
      chatRoomData.unreadCounts = helloMessage.length;
      chatRoomData.lastAccess = new Date();
      chatRoomData.lastChat = helloMessage[helloMessage.length - 1].includes(
        'https:',
      )
        ? '사진'
        : helloMessage[helloMessage.length - 1];
    }

    user.chatRoomDatas.set(id, chatRoomData);
    await user.save();

    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;
    const userSpecificHello = helloMessage.map((chat) => {
      return nicknameModifier(nickname, chat);
    });

    if (userSpecificHello) {
      return {
        characterId: helloMessageSet.characterId,
        helloMessage: userSpecificHello,
      };
    } else {
      winstonLogger.warn("no such character's hello message", {
        user,
        helloMessageSet,
      });
      throw new HttpException('no such character', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(CommonJwtGuard)
  @Post('hello/:id')
  @HttpCode(HttpStatus.CREATED)
  async setCharacterHello(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('helloMessage') helloMessage: string[],
    @Body('type') type: string,
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin') {
      throw new HttpException('unauthorized access', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.characterService.setCharacterHello(
      id,
      helloMessage,
      type,
    );
    return { message: 'hello message set', ...helloMessage, result };
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @Post('request-create')
  @HttpCode(201)
  async requestCharacterCreation(
    @Req() req: Request,
    @UploadedFile() images: Array<Express.Multer.File>,
    @Body() characterCreationDTO: CharacterCreationDTO,
  ) {
    const user = req.user as UserDocument;
    const result = await this.characterService.saveCharacterCreationRequest(
      user._id,
      characterCreationDTO,
    );

    return result;
  }

  @UseGuards(CommonJwtGuard)
  @Get('chatroom-info/:id')
  @HttpCode(200)
  async getChatRoomInfo(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserDocument;
    const chatRoomData = user.chatRoomDatas.get(id);
    if (chatRoomData) {
      const character = await this.characterService.getCharacterInfo(id);
      const { profilePicUrl, name } = character;

      return { profilePicUrl, name, ...chatRoomData };
    } else {
      throw new HttpException('no such chatroom', HttpStatus.BAD_REQUEST);
    }
  }
}
