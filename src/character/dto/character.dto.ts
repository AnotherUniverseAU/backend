import { Genre } from 'src/global/enum/genre.enum';
import { Character, CharacterDocument } from 'src/schemas/character.schema';

export class CharacterDTO {
  readonly characterId: string; //캐릭터 식별자
  readonly creatorNickname: string; //만든 사람 닉네임
  readonly creatorWords: string; //캐릭터 소개
  readonly contributroNicknames: string[]; //기여자 닉네임들 []
  readonly name: string; //캐릭터 이름
  readonly title: string; //캐릭터 소속 작품 이름
  readonly hashtags: string[]; //해시태그들 [] @@해시태그(#) 미포함
  readonly mainImageUrl: string; //s3 이미지 링크
  readonly helloMessageDay: string[];
  readonly helloMessageNight: string[];
  readonly coverImageUrl: string; //s3 이미지 링크
  readonly profilePicUrl: string; //s3 이미지 링크
  readonly genre: Genre; //장르

  readonly isMain: boolean; //메인 캐릭터 여부

  constructor(character: Character) {
    this.characterId = character._id.toString();
    this.creatorNickname = character.creator.nickname;
    this.creatorWords = character.creatorWords;
    this.contributroNicknames = character.contributors.map((contributor) => {
      return contributor.nickname;
    });
    this.name = character.name;
    this.title = character.title;
    this.hashtags = character.hashtags;
    this.profilePicUrl = character.profilePicUrl;
    this.genre = character.genre;
    this.helloMessageDay = character.helloMessageDay;
    this.helloMessageNight = character.helloMessageNight;
    this.isMain = character.isMain;
    this.coverImageUrl = character.coverImageUrl;
    this.mainImageUrl = character.mainImageUrl;
  }

  toShort() {
    return {
      characterId: this.characterId,
      creatorNickname: this.creatorNickname,
      name: this.name,
      title: this.title,
      genre: this.genre,
      coverImageUrl: this.coverImageUrl,
      mainImageUrl: this.mainImageUrl,
      isMain: this.isMain,
    };
  }

  toHello() {
    return {
      characterId: this.characterId,
      helloMessageDay: this.helloMessageDay,
      helloMessageNight: this.helloMessageNight,
    };
  }

  toFull() {
    return {
      characterId: this.characterId,
      creatorNickname: this.creatorNickname,
      creatorWords: this.creatorWords,
      contributroNicknames: this.contributroNicknames,
      name: this.name,
      title: this.title,
      hashtags: this.hashtags,
      mainImageUrl: this.mainImageUrl,
      coverImageUrl: this.coverImageUrl,
      profilePicUrl: this.profilePicUrl,
      genre: this.genre,
      isMain: this.isMain,
    };
  }

  toNameAndPic() {
    return {
      characterId: this.characterId,
      name: this.name,
      profilePicUrl: this.profilePicUrl,
    };
  }
}
