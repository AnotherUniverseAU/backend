import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import { Character, CharacterDocument } from 'src/schemas/character.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectModel(Character.name) private characterModel: Model<Character>,
  ) {}

  //needs paging
  async findAll(): Promise<CharacterDocument[]> {
    const characters = await this.characterModel.find({});
    return characters;
  }

  async findById(id: string): Promise<CharacterDocument> {
    const character = await this.characterModel.findById(id);
    return character;
  }

  async create(characterData: any) {
    const newInstance = new this.characterModel(characterData);
    return await newInstance.save();
  }
}
