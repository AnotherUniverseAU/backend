import { CharacterReport } from '../domain';
import { Types } from 'mongoose';

export class PostComplainResponse {
  constructor(
    readonly characterId: Types.ObjectId,
    readonly reporterId: Types.ObjectId,
    readonly complainment: string,
  ) {}

  static fromDomain(characterReport: CharacterReport): PostComplainResponse {
    return new PostComplainResponse(
      characterReport.characterId,
      characterReport.reporterId,
      characterReport.complainment,
    );
  }
}
