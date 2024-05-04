import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model, Types } from 'mongoose';
import { CharacterReport } from 'src/schemas/character-report.schema';
import { Character, CharacterDocument } from 'src/schemas/character.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectModel(Character.name) private characterModel: Model<Character>,
    @InjectModel(CharacterReport.name)
    private characterReportModel: Model<CharacterReport>,
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

  async updateById(characterId: string, payload: any) {
    const result = await this.characterModel.updateOne(
      { _id: new Types.ObjectId(characterId) },
      { $set: payload },
    );
    return result;
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
