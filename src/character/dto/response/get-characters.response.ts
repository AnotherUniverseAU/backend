import { Types } from 'mongoose';
import { Character } from '../../charcter';
import { CharacterCreationDTO } from '../character-creation.dto';

export class GetCharactersReponse {
  constructor(
    readonly characterId: Types.ObjectId,
    readonly creatorNickname: string,
    readonly name: string,
    readonly title: string,
    readonly genre: string,
    readonly coverImageUrl: string,
    readonly mainImageUrl: string,
    readonly isMain: boolean,
  ) {}

  static fromDomain(character: Character) {
    return new GetCharactersReponse(
      character._id,
      character.creator.nickname,
      character.name,
      character.title,
      character.genre,
      character.coverImageUrl,
      character.mainImageUrl,
      character.isMain,
    );
  }
}
