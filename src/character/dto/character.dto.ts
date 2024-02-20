import { Character, CharacterDocument } from 'src/schemas/character.schema';

export class CharacterDTO {
  readonly id: string; //캐릭터 식별자
  readonly creatorNickname: string; //만든 사람 닉네임
  readonly creatorWords: string; //캐릭터 소개
  readonly contributroNicknames: string[]; //기여자 닉네임들 []
  readonly name: string; //캐릭터 이름
  readonly title: string; //캐릭터 소속 작품 이름
  readonly hashtags: string[]; //해시태그들 [] @@해시태그(#) 미포함
  readonly coverImageUrl: string; //s3 이미지 링크
  readonly likes: number; //좋아요 수
  readonly profilePicUrl: string; //s3 이미지 링크

  constructor(character: Character) {
    this.id = character._id.toString();
    this.creatorNickname = character.creator.nickname;
    this.creatorWords = character.creatorWords;
    this.contributroNicknames = character.contributors.map((contributor) => {
      return contributor.nickname;
    });
    this.name = character.name;
    this.title = character.title;
    this.hashtags = character.hashtags;
    this.coverImageUrl = character.coverImageUrl;
    this.likes = character.likes;
    this.profilePicUrl = character.profilePicUrl;
  }
  short() {
    return {
      id: this.id,
      creatorNickname: this.creatorNickname,
      name: this.name,
      title: this.title,
      coverImageUrl: this.coverImageUrl,
    };
  }
}
