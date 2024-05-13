import { Character } from '../domain/character';

export class GetCharacterInfoReponse {
  constructor(
    readonly isNew: boolean,
    readonly character: {
      readonly characterId: string;
      readonly creatorNickname: string;
      readonly creatorWords: string;
      readonly contributorNicknames: string[];
      readonly name: string;
      readonly title: string;
      readonly hashtags: string[];
      readonly mainImageUrl: string;
      readonly helloMessageDay: string[];
      readonly helloMessageNight: string[];
      readonly coverImageUrl: string;
      readonly profilePicUrl: string;
      readonly genre: string;
    },
  ) {}

  static fromDomain(isNew: boolean, character: Character) {
    return new GetCharacterInfoReponse(isNew, {
      characterId: character._id.toString(),
      creatorNickname: character.creator.nickname,
      creatorWords: character.creatorWords,
      contributorNicknames: character.contributors.map(
        (contributor) => contributor.nickname,
      ),
      name: character.name,
      title: character.title,
      hashtags: character.hashtags,
      mainImageUrl: character.mainImageUrl,
      helloMessageDay: character.helloMessageDay,
      helloMessageNight: character.helloMessageNight,
      coverImageUrl: character.coverImageUrl,
      profilePicUrl: character.profilePicUrl,
      genre: character.genre,
    });
  }
}
