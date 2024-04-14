import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Gender } from 'src/global/enum/gender.enum';
import { Genre } from 'src/global/enum/genre.enum';

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

  @Prop({ type: String, enum: Genre, required: true })
  genre: Genre;

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
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
