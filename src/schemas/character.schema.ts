import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Character as CharacterDomain } from 'src/character/dto/domain';

export type CharacterDocument = HydratedDocument<Character>;

@Schema()
export class UserReference {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  nickname: string;
}

@Schema()
export class Character {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: UserReference, required: true })
  creator: UserReference;

  @Prop({ type: String, default: '' })
  creatorWords: string;

  @Prop({ type: [UserReference], default: [] })
  contributors: UserReference[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  genre: string;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({
    type: String,
    default:
      'https://anotheruniverse.blob.core.windows.net/user-reply-image/springfield (2).png',
  })
  coverImageUrl: string;

  @Prop({
    type: String,
    default:
      'https://anotheruniverse.blob.core.windows.net/user-reply-image/18822cf2b4512c2ec (1).jpg',
  })
  mainImageUrl: string;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({
    type: String,
    default:
      'https://anotheruniverse.blob.core.windows.net/user-reply-image/18822cf2b4512c2ec (1).jpg',
  })
  profilePicUrl: string;

  @Prop([{ type: String, default: [] }])
  helloMessageDay: string[];

  @Prop([{ type: String, default: [] }])
  helloMessageNight: string[];

  @Prop({ type: Boolean, default: false })
  isMain: boolean;

  toDomain: () => CharacterDomain;

  updateFromDomain: (CharacterDomain) => void;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

CharacterSchema.methods.toDomain = function (): CharacterDomain {
  return new CharacterDomain(
    this._id,
    this.creator,
    this.creatorWords,
    this.contributors,
    this.name,
    this.title,
    this.genre,
    this.hashtags,
    this.coverImageUrl,
    this.mainImageUrl,
    this.likes,
    this.profilePicUrl,
    this.helloMessageDay,
    this.helloMessageNight,
    this.isMain,
  );
};

CharacterSchema.methods.updateFromDomain = function (
  character: CharacterDomain,
) {
  this.creatorWords = character.creatorWords;
  this.contributors = character.contributors;
  this.name = character.name;
  this.title = character.title;
  this.genre = character.genre;
  this.hashtags = character.hashtags;
  this.coverImageUrl = character.coverImageUrl;
  this.mainImageUrl = character.mainImageUrl;
  this.likes = character.likes;
  this.profilePicUrl = character.profilePicUrl;
  this.helloMessageDay = character.helloMessageDay;
  this.helloMessageNight = character.helloMessageNight;
  this.isMain = character.isMain;
};
