import { Types } from 'mongoose';
import { CharacterCreationRequest } from '../request/character-creation.request';
import { CharacterCreation } from '../domain';

export class CharacterCreationCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly name: string,
    public readonly title: string,
    public readonly genre: string,
    public readonly creatorWords: string,
    public readonly gender: string,
    public readonly appearance: string,
    public readonly personality: string,
    public readonly hobby: string,
    public readonly tone: string,
    public readonly extraInfo: string,
    public readonly summary: string,
    public readonly relationship: string,
    public readonly email: string,
  ) {}

  static fromRequest(
    userId: Types.ObjectId,
    characterCreationRequest: CharacterCreationRequest,
  ): CharacterCreationCommand {
    return new CharacterCreationCommand(
      userId,
      characterCreationRequest.name,
      characterCreationRequest.title,
      characterCreationRequest.genre,
      characterCreationRequest.creatorWords,
      characterCreationRequest.gender,
      characterCreationRequest.appearance,
      characterCreationRequest.personality,
      characterCreationRequest.hobby,
      characterCreationRequest.tone,
      characterCreationRequest.extraInfo,
      characterCreationRequest.summary,
      characterCreationRequest.relationship,
      characterCreationRequest.email,
    );
  }

  toDomain(): CharacterCreation {
    return new CharacterCreation(
      this.userId,
      this.name,
      this.title,
      this.genre,
      this.gender,
      this.creatorWords,
      this.appearance,
      this.personality,
      this.hobby,
      this.tone,
      this.extraInfo,
      this.summary,
      this.relationship,
      this.email,
    );
  }
}
