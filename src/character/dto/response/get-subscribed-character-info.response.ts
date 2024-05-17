import { Character } from '../domain';

export class GetSubscribedCharacterInfoResponse {
  constructor(
    readonly characters: {
      readonly characterId: string;
      readonly name: string;
      readonly profilePicUrl: string;
    }[],
  ) {}

  static fromDomain(
    characters: Character[],
  ): GetSubscribedCharacterInfoResponse {
    return new GetSubscribedCharacterInfoResponse(
      characters.map((character) => ({
        characterId: character._id.toString(),
        name: character.name,
        profilePicUrl: character.profilePicUrl,
      })),
    );
  }
}
