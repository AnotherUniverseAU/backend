import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model, Types } from 'mongoose';
import { Character, CharacterReport } from 'src/character/dto/domain';
import { CharacterReportEntity } from 'src/schemas/character-report.schema';
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
    @InjectModel(CharacterReportEntity.name)
    private characterReportModel: Model<CharacterReportEntity>,
  ) {}

  //needs paging
  async findAll(): Promise<Character[]> {
    const characters = await this.characterModel.find({});
    return characters.map((character) => character.toDomain());
  }

  async findById(id: string | Types.ObjectId): Promise<Character> {
    const character = await this.characterModel.findById(id);
    return character.toDomain();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<Character[]> {
    const characters = await this.characterModel
      .find({ _id: { $in: ids } })
      .exec();
    return characters.map((character) => character.toDomain());
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
    const characterEntity = await this.characterModel.findById(character._id);

    characterEntity.updateFromDomain(character);

    await characterEntity.save();
  }

  async createCharacterReport(
    characterReport: CharacterReport,
  ): Promise<CharacterReport> {
    const newReport = await this.characterReportModel.create({
      characterReport,
    });

    // const newReport = await this.characterReportModel.create({
    //   characterId,
    //   reporterId: userId,
    //   complainment,
    // });

    return newReport;
  }
}
