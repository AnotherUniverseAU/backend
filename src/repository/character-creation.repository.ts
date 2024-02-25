import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CharacterCreationDTO } from 'src/character/dto/character-creation.dto';
import { CharacterCreation } from 'src/schemas/character-creation.schema';

export class CharacterCreationRepository {
  constructor(
    @InjectModel(CharacterCreation.name)
    private characterCreationModel: Model<CharacterCreation>,
  ) {}

  async create(
    userId: Types.ObjectId,
    characterCreationDTO: CharacterCreationDTO,
  ): Promise<CharacterCreation> {
    const characterCreation = new this.characterCreationModel({
      creator: userId,
      ...characterCreationDTO,
    });
    await characterCreation.save();
    return characterCreation;
  }
}
