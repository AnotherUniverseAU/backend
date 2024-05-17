import { Types } from 'mongoose';
import { CharacterReport } from '../domain';

export class SaveCharacterReportCommand {
  constructor(
    public readonly characterId: Types.ObjectId,
    public readonly reporterId: Types.ObjectId,
    public readonly complainment: string,
  ) {}

  static fromRequest(
    characterId: string,
    userId: Types.ObjectId,
    complainment: string,
  ): SaveCharacterReportCommand {
    return new SaveCharacterReportCommand(
      new Types.ObjectId(characterId),
      userId,
      complainment,
    );
  }

  toDomain(): CharacterReport {
    return new CharacterReport(
      this.characterId,
      this.reporterId,
      this.complainment,
    );
  }
}
