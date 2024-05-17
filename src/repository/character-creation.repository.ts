import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CharacterCreation } from 'src/character/dto/domain';
import { CharacterCreationEntity } from 'src/schemas/character-creation.schema';

export class CharacterCreationRepository {
  constructor(
    @InjectModel(CharacterCreationEntity.name)
    private characterCreationModel: Model<CharacterCreationEntity>,
  ) {}

  async create(
    characterCreation: CharacterCreation,
  ): Promise<CharacterCreation> {
    await new this.characterCreationModel({ characterCreation }).save();
    return characterCreation;
  }

  // async create(
  //   characterCreation: CharacterCreation,
  // ): Promise<CharacterCreation> {
  //   const characterCreation = new this.characterCreationModel({
  //     creator: userId,
  //     ...characterCreationDTO,
  //   });
  //   await characterCreation.save();
  //   return characterCreation;
  // }
}
