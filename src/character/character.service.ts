import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Character } from 'src/schemas/character.schema';
import { Model, Types } from 'mongoose';
import { CharacterRepository } from 'src/repository/character.repository';
import { User, UserDocument } from 'src/schemas/user.schema';
@Injectable()
export class CharacterService {
  constructor(private characterRepo: CharacterRepository) {}

  async getAllCharacters(): Promise<Character[]> {
    const characters = await this.characterRepo.findAll();
    return characters;
  }

  async getCharacterInfo(characterId: string): Promise<Character> {
    const character = await this.characterRepo.findById(characterId);
    return character;
  }

  async createCharacter(characterData: any): Promise<Character> {
    const character = await this.characterRepo.create(characterData);
    return character;
  }
}
