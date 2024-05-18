import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model, Types, UpdateWriteOpResult } from 'mongoose';
import {
  Character as CharacterDomain,
  CharacterReport as CharacterReportDomain,
} from 'src/character/dto/domain';
import { CharacterReportEntity } from 'src/schemas/character-report.schema';
import {
  CharacterEntity,
  CharacterDocument,
} from 'src/schemas/character.schema';

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectModel(CharacterEntity.name)
    private characterModel: Model<CharacterEntity>,
    @InjectModel(CharacterReportEntity.name)
    private characterReportModel: Model<CharacterReportEntity>,
  ) {}

  //needs paging
  async findAll(): Promise<CharacterDomain[]> {
    const characters = await this.characterModel.find({});
    return characters.map((character) => character.toDomain());
  }

  async findById(id: string | Types.ObjectId): Promise<CharacterDomain> {
    const character = await this.characterModel.findById(id);
    return character.toDomain();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<CharacterDomain[]> {
    const characters = await this.characterModel
      .find({ _id: { $in: ids } })
      .exec();

    return characters.map((character) => character.toDomain());
  }

  async findMainCharacter(): Promise<CharacterDomain> {
    const mainCharacter = await this.characterModel.findOne({ isMain: true });
    return mainCharacter.toDomain();
  }

  //현재 사용안함
  async create(characterData: any) {
    const newInstance = new this.characterModel(characterData);
    return await newInstance.save();
  }

  // characterEntity.updateFromDomain(character);
  // UpdateWriteOpResult 타입을 리턴해야해서 updateFromDomain보류
  async updateHelloMessage(
    character: CharacterDomain,
  ): Promise<UpdateWriteOpResult> {
    const { helloMessageDay, helloMessageNight } = character;
    const result = await this.characterModel.updateOne(
      { _id: new Types.ObjectId(character._id) },
      {
        $set: {
          helloMessageDay: helloMessageDay,
          helloMessageNight: helloMessageNight,
        },
      },
    );
    return result;
  }

  //현재 사용안함
  async update(character: CharacterDomain) {
    const characterEntity = await this.characterModel.findById(character._id);
    characterEntity.updateFromDomain(character);
    characterEntity.save();
  }

  async createCharacterReport(
    characterReport: CharacterReportDomain,
  ): Promise<CharacterReportDomain> {
    const newReport = await this.characterReportModel.create(characterReport);

    // const newReport = await this.characterReportModel.create({
    //   characterId,
    //   reporterId: userId,
    //   complainment,
    // });

    return newReport;
  }
}
