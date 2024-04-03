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
  @Get('pic-name')
  @HttpCode(200)
  async getCharacterPictureAndName(@Req() req: Request) {
    const user = req.user as UserDocument;

    const subscribedCharacterIds = user.subscribedCharacters;
    const nameAndPics = await this.characterService.getCharacterPictureAndName(
      subscribedCharacterIds,
    );

    return nameAndPics;
  }

  @UseGuards(CommonJwtGuard)
  @Get(':id')
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
    const helloMessage = await this.characterService.getCharacterHello(id);

    const chatRoomData = user.chatRoomDatas.get(id);
    chatRoomData.lastChat = helloMessage[helloMessage.helloMessage.length - 1];
    chatRoomData.unreadCounts = helloMessage.helloMessage.length;
    user.chatRoomDatas.set(id, chatRoomData);
    await user.save();

    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;
    const userSpecificHello = helloMessage.helloMessage.map((chat) => {
      return nicknameModifier(nickname, chat);
    });

    if (helloMessage) {
      return {
        characterId: helloMessage.characterId,
        helloMessage: userSpecificHello,
      };
    } else {
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
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin') {
      throw new HttpException('unauthorized access', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.characterService.setCharacterHello(
      id,
      helloMessage,
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
}
