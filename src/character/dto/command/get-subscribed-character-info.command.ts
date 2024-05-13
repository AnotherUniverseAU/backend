import { Types } from 'mongoose';

export class GetSubscribedCharacterInfoCommand {
  constructor(public readonly subscribedCharacters: Types.ObjectId[]) {}

  static fromSubscribedCharacters(
    subscribedCharacters: Types.ObjectId[],
  ): GetSubscribedCharacterInfoCommand {
    return new GetSubscribedCharacterInfoCommand(subscribedCharacters);
  }
}
