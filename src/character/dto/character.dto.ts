import { CharacterDocument } from 'src/schemas/character.schema';

export class CharacterDTO {
  readonly id: string; //캐릭터 식별자
  readonly creatorNickname: string; //만든 사람 닉네임
  readonly creatorWords: string; //캐릭터 소개
  readonly contributroNicknames: string[]; //기여자 닉네임들 []
  readonly name: string; //캐릭터 이름
  readonly title: string; //캐릭터 소속 작품 이름
  readonly hashtags: string[]; //해시태그들 [] @@해시태그(#) 미포함
  readonly imgUrl: string; //s3 이미지 링크

  constructor(character: CharacterDocument) {
    this.id = character._id.toString();
    this.creatorNickname = character.creator.nickname;
    this.creatorWords = character.creatorWords;
    this.contributroNicknames = character.contributors.map((contributor) => {
      return contributor.nickname;
    });
    this.name = character.name;
    this.title = character.title;
    this.hashtags = character.hashtags;
    this.imgUrl = character.imgUrl;
  }
  short() {
    return {
      id: this.id,
      creatorNickname: this.creatorNickname,
      name: this.name,
      title: this.title,
      imgUrl: this.imgUrl,
    };
  }
}
