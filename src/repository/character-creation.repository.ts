import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CharacterCreation } from 'src/character/dto/domain';

export class CharacterCreationRepository {
  constructor(
    @InjectModel(CharacterCreation.name)
    private characterCreationModel: Model<CharacterCreation>,
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
