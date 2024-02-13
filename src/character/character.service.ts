import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Character } from 'src/schemas/character.schema';
import { Model } from 'mongoose';
import { CharacterRepository } from 'src/repository/character.repository';
@Injectable()
export class CharacterService {
  constructor(private characterRepo: CharacterRepository) {}

  async getAllCharacters() {
    const characters = await this.characterRepo.findAll();
    return characters;
  }

  async getCharacterInfo(id: string) {
    const character = await this.characterRepo.findById(id);
    return character;
  }

  async createCharacter(characterData: any) {
    const character = await this.characterRepo.create(characterData);
    return character;
  }
}
