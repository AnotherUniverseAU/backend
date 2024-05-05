import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model, Types } from 'mongoose';
import { Character } from 'src/character/charcter';
import { CharacterReport } from 'src/schemas/character-report.schema';
import {
  CharacterEntity,
  CharacterDocument,
} from 'src/schemas/character.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectModel(CharacterEntity.name)
    private characterModel: Model<CharacterEntity>,
    @InjectModel(CharacterReport.name)
    private characterReportModel: Model<CharacterReport>,
  ) {}

  //needs paging
  async findAll(): Promise<Character[]> {
    const characters = await this.characterModel.find({});

    return characters.map((characterEntity) => {
      return characterEntity.toDomain();
    });
  }

  async findById(id: string | Types.ObjectId): Promise<Character> {
    const character = await this.characterModel.findById(id);
    return character.toDomain();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<CharacterDocument[]> {
    const characters = await this.characterModel
      .find({ _id: { $in: ids } })
      .exec();
    return characters;
  }

  async findMainCharacter(): Promise<CharacterDocument> {
    const mainCharacter = await this.characterModel.findOne({ isMain: true });
    return mainCharacter;
  }

  async create(characterData: any) {
    const newInstance = new this.characterModel(characterData);
    return await newInstance.save();
  }

  async update(character: Character) {
    const characterEntity = await this.characterModel.findById(characterId);

    characterEntity.updateFromDomain(character);

    await characterEntity.save();
  }

  async createCharacterReport(
    characterId: Types.ObjectId,
    userId: Types.ObjectId,
    complainment: string,
  ): Promise<CharacterReport> {
    const newReport = await this.characterReportModel.create({
      characterId,
      reporterId: userId,
      complainment,
    });

    return newReport;
  }
}
