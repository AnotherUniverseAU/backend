import { Injectable } from '@nestjs/common';
import { Character } from 'src/schemas/character.schema';
import { Types } from 'mongoose';
import { CharacterRepository } from 'src/repository/character.repository';
import { CharacterCreationDTO } from './dto/character-creation.dto';
import { CharacterCreationRepository } from 'src/repository/character-creation.repository';
import { CharacterCreation } from 'src/schemas/character-creation.schema';
@Injectable()
export class CharacterService {
  constructor(
    private characterRepo: CharacterRepository,
    private characterCreationRepo: CharacterCreationRepository,
  ) {}

  async getAllCharacters(): Promise<Character[]> {
    const characters = await this.characterRepo.findAll();
    return characters;
  }

  async getCharacterInfo(characterId: string): Promise<Character> {
    const character = await this.characterRepo.findById(characterId);
    return character;
  }

  async getMainCharacter(): Promise<Character> {
    const mainCharacter = await this.characterRepo.findMainCharacter();
    return mainCharacter;
  }

  async getCharacterHello(characterId: string): Promise<string[]> {
    const helloMessage = await this.characterRepo.getHelloMessage(characterId);
    return helloMessage;
  }

  async createCharacter(characterData: any): Promise<Character> {
    const character = await this.characterRepo.create(characterData);
    return character;
  }

  async saveCharacterCreationRequest(
    userId: Types.ObjectId,
    characterCreationDTO: CharacterCreationDTO,
  ): Promise<CharacterCreation> {
    const characterCreation = await this.characterCreationRepo.create(
      userId,
      characterCreationDTO,
    );

    return characterCreation;
  }
}
