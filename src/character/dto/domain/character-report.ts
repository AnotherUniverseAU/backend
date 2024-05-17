import { Types } from 'mongoose';

export class CharacterReport {
  constructor(
    public characterId: Types.ObjectId,
    public reporterId: Types.ObjectId,
    public complainment: string,
  ) {}
}
