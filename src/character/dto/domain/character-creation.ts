import { Types } from 'mongoose';

export class CharacterCreation {
  constructor(
    public creator: Types.ObjectId,
    public name: string,
    public title: string,
    public genre: string,
    public gender: string,
    public creatorWords: string,
    public appearance: string,
    public personality: string,
    public hobby: string,
    public tone: string,
    public extraInfo: string,
    public summary: string,
    public relationship: string,
    public email: string,
  ) {}
}
