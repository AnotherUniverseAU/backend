import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Character, CharacterSchema } from 'src/schemas/character.schema';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { CharacterRepository } from 'src/repository/character.repository';
import { AuthModule } from 'src/auth/auth.module';
import {
  CharacterCreationEntity,
  CharacterCreationSchema,
} from 'src/schemas/character-creation.schema';
import { CharacterCreationRepository } from 'src/repository/character-creation.repository';
import {
  CharacterReportEntity,
  CharacterReportSchema,
} from 'src/schemas/character-report.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: CharacterCreationEntity.name, schema: CharacterCreationSchema },
      { name: CharacterReportEntity.name, schema: CharacterReportSchema },
    ]),
  ],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    CharacterRepository,
    CharacterCreationRepository,
  ],
})
export class CharacterModule {}
