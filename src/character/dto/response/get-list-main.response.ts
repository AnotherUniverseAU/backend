import { Character } from '../domain';

export class GetListMainResponse {
  constructor(
    readonly mainCharacter: {
      readonly characterId: string;
      readonly helloMessageDay: string[];
      readonly helloMessageNight: string[];
    },
  ) {}

  static fromDomain(character: Character) {
    return new GetListMainResponse({
      characterId: character._id.toString(),
      helloMessageDay: character.helloMessageDay,
      helloMessageNight: character.helloMessageNight,
    });
  }
}
