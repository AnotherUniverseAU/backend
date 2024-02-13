import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CharacterService } from './character.service';
import { CommonJwtGuard } from 'src/auth/common-jwt.guard';
import { Request } from 'express';
import { UserDocument } from 'src/schemas/user.schema';
import { CharacterDTO } from './dto/character.dto';
import { Types } from 'mongoose';

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
        return new CharacterDTO(character).short();
      });
      return { characters: shortCharacterDTOs };
    } else {
      return { characters: [] };
    }
  }

  @UseGuards(CommonJwtGuard)
  @Get(':id')
  @HttpCode(200)
  async getCharcterInfo(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as UserDocument;

    const character = await this.characterService.getCharacterInfo(id);
    if (character) {
      const characterDTO = new CharacterDTO(character);
      return { isNew: user.isNew, character: characterDTO };
    } else {
      throw new HttpException('no such character', HttpStatus.BAD_REQUEST);
    }
  }
}
