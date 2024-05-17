import { CharacterCreation } from '../domain';
import { Types } from 'mongoose';

export class CharacterCreationResponse {
  constructor(
    public creator: Types.ObjectId,
    public name: string,
    public title: string,
    public genre: string,
    public gender: string,
    public creatorWords: string,
    public appearance: string,
    public personality: string,
    public hobby: string,
    public tone: string,
    public extraInfo: string,
    public summary: string,
    public relationship: string,
    public email: string,
  ) {}

  static fromDomain(
    characterCreation: CharacterCreation,
  ): CharacterCreationResponse {
    return new CharacterCreationResponse(
      characterCreation.creator,
      characterCreation.name,
      characterCreation.title,
      characterCreation.genre,
      characterCreation.creatorWords,
      characterCreation.gender,
      characterCreation.appearance,
      characterCreation.personality,
      characterCreation.hobby,
      characterCreation.tone,
      characterCreation.extraInfo,
      characterCreation.summary,
      characterCreation.relationship,
      characterCreation.email,
    );
  }
}
