import { Character } from '../domain/character';

export class GetAllCharactersResponse {
  constructor(
    readonly characters: {
      readonly characterId: string;
      readonly creatorNickname: string;
      readonly name: string;
      readonly title: string;
      readonly genre: string;
      readonly coverImageUrl: string;
      readonly mainImageUrl: string;
      readonly isMain: boolean;
    }[],
  ) {}

  static fromDomain(characters: Character[]) {
    return new GetAllCharactersResponse(
      characters.map((character) => ({
        characterId: character._id.toString(),
        creatorNickname: character.creator.nickname,
        name: character.name,
        title: character.title,
        genre: character.genre,
        coverImageUrl: character.coverImageUrl,
        mainImageUrl: character.mainImageUrl,
        isMain: character.isMain,
      })),
    );
  }
}
