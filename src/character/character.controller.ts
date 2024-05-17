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
import { Types } from 'mongoose';
import { FilesInterceptor } from '@nestjs/platform-express';
import { winstonLogger } from 'src/common/logger/winston.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Character } from './dto/domain';
import {
  CharacterCreationRequest,
  PostComplainRequest,
  SetCharacterHelloRequest,
} from './dto/request';
import {
  CharacterCreationCommand,
  GetSubscribedCharacterInfoCommand,
  SaveCharacterReportCommand,
  SetCharacterHelloCommand,
} from './dto/command';
import {
  CharacterCreationResponse,
  GetAllCharactersResponse,
  GetCharacterInfoReponse,
  GetChatRoomInfoResponse,
  GetListMainResponse,
  GetSubscribedCharacterInfoResponse,
  SetCharacterHelloResponse,
} from './dto/response';
import { PostComplainResponse } from './dto/response/post-complain.response';

@Controller('character')
export class CharacterController {
  constructor(
    private characterService: CharacterService,
    private eventEmitter: EventEmitter2,
  ) {}

  //may work for fater guard => not finding the user just authenticating
  //also need paging
  @UseGuards(CommonJwtGuard)
  @Get('list')
  @HttpCode(200)
  async getCharacters() {
    const characters = await this.characterService.getAllCharacters();
    return GetAllCharactersResponse.fromDomain(characters);

    // if (characters) {
    //   const shortCharacterDTOs = characters.map((character) => {
    //     return new CharacterDTO(character).toShort();
    //   });
    //   return { characters: shortCharacterDTOs };
    // } else {
    //   return { characters: [] };
    // }
  }

  @UseGuards(CommonJwtGuard)
  @Get('main-character')
  @HttpCode(200)
  async getListMain() {
    const mainCharacter = await this.characterService.getMainCharacter();
    return GetListMainResponse.fromDomain(mainCharacter);

    // const characterDTO = new CharacterDTO(mainCharacter);
    // return { mainCharacter: characterDTO.toShort() };
  }

  @UseGuards(CommonJwtGuard)
  @Get('info/bulk')
  @HttpCode(200)
  async getSubscribedCharacterInfo(@Req() req: Request) {
    const user = req.user as UserDocument;

    const subscribedCharacters = user.subscribedCharacters;

    if (!subscribedCharacters) {
      throw new HttpException(
        'subscribedCharacters are empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const getSubscribedCharacterInfoCommand =
      GetSubscribedCharacterInfoCommand.fromSubscribedCharacters(
        subscribedCharacters,
      );

    const characters = await this.characterService.getSubscribedCharacterInfo(
      getSubscribedCharacterInfoCommand,
    );

    return GetSubscribedCharacterInfoResponse.fromDomain(characters);
    // return { characters: characterDtos };
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
      return GetCharacterInfoReponse.fromDomain(user.isNew, character);
      // const characterDTO = new CharacterDTO(character);
      // return { isNew: user.isNew, character: characterDTO };
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

    const { userSpecificHello, character } =
      await this.characterService.getCharacterHello(
        new Types.ObjectId(id),
        user.toDomain(),
      );

    const { _id, helloMessageDay, helloMessageNight } = character;

    if (userSpecificHello) {
      return {
        characterId: id,
        helloMessage: userSpecificHello,
      };
    } else {
      winstonLogger.warn("no such character's hello message", {
        user,
        helloMessageSet: {
          characterId: _id,
          helloMessageDay,
          helloMessageNight,
        },
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
    @Body() setCharacterHelloRequest: SetCharacterHelloRequest,
  ) {
    const user = req.user as UserDocument;
    if (user.role != 'admin') {
      throw new HttpException('unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    const { type } = setCharacterHelloRequest;

    if (type != 'day' && type != 'night') {
      throw new HttpException(
        'type must be day or night',
        HttpStatus.BAD_REQUEST,
      );
    }

    const setCharacterHelloCommand = SetCharacterHelloCommand.fromRequest(
      id,
      setCharacterHelloRequest,
    );

    const result = await this.characterService.setCharacterHello(
      setCharacterHelloCommand,
    );

    return SetCharacterHelloResponse.fromResult(
      setCharacterHelloCommand.helloMessage,
      result,
    );
  }

  @UseGuards(CommonJwtGuard)
  @UseInterceptors(FilesInterceptor('images'))
  @Post('request-create')
  @HttpCode(201)
  async requestCharacterCreation(
    @Req() req: Request,
    @UploadedFile() images: Array<Express.Multer.File>,
    @Body() characterCreationRequest: CharacterCreationRequest,
  ) {
    const user = req.user as UserDocument;
    const characterCreationCommand = CharacterCreationCommand.fromRequest(
      user.id,
      characterCreationRequest,
    );
    const characterCreation =
      await this.characterService.saveCharacterCreationRequest(
        characterCreationCommand,
      );

    return CharacterCreationResponse.fromDomain(characterCreation);
    // const result = await this.characterService.saveCharacterCreationRequest(
    //   user._id,
    //   characterCreationDTO,
    // );
    // return result;
  }

  @UseGuards(CommonJwtGuard)
  @Get('chatroom-info/:id')
  @HttpCode(200)
  async getChatRoomInfo(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserDocument;

    //Todo : user refactoring후 수정
    const chatRoomData = user.chatRoomDatas.get(id).toDomain();

    if (chatRoomData) {
      const character = await this.characterService.getCharacterInfo(id);
      return GetChatRoomInfoResponse.fromDomain(character, chatRoomData);
      // const { profilePicUrl, name } = character;
      // return { profilePicUrl, name, ...chatRoomData };
    } else {
      throw new HttpException('no such chatroom', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(CommonJwtGuard)
  @Post('complain/:characterId')
  @HttpCode(201)
  async postComplain(
    @Req() req: Request,
    @Param('characterId') characterId: string,
    @Body() postComplainRequest: PostComplainRequest,
  ) {
    const user = req.user as UserDocument;

    const { complainment, isRejected } = postComplainRequest;

    const saveCharacterReportCommand = SaveCharacterReportCommand.fromRequest(
      characterId,
      user.id,
      complainment,
    );

    const characterReport = await this.characterService.saveCharacterReport(
      saveCharacterReportCommand,
    );

    // user service, subscription에서 분기 처리
    winstonLogger.log(`[${user._id}]유저 [${characterId}]캐릭터 차단`);
    if (isRejected === true)
      this.eventEmitter.emit('reject-character', user._id, characterId);

    return PostComplainResponse.fromDomain(characterReport);
  }
}
