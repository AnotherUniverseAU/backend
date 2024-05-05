import { Types } from 'mongoose';

class _UserReference {
  _id: Types.ObjectId;
  nickname: string;
}

export class Character {
  constructor(
    public _id: Types.ObjectId,
    public creator: _UserReference,
    public creatorWords: string,
    public contributors: _UserReference[],
    public name: string,
    public title: string,
    public genre: string,
    public hashtags: string[],
    public coverImageUrl: string,
    public mainImageUrl: string,
    public likes: number,
    public profilePicUrl: string,
    public helloMessageDay: string[],
    public helloMessageNight: string[],
    public isMain: boolean,
  ) {}
}
