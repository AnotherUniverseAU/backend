import { Types } from 'mongoose';
import { SetCharacterHelloRequest } from '../request/set-character-hello.request';

export class SetCharacterHelloCommand {
  constructor(
    public readonly characterId: Types.ObjectId,
    public readonly helloMessage: string[],
    public readonly type: string,
  ) {}

  static fromRequest(
    characterId: string,
    setCharacterHelloRequest: SetCharacterHelloRequest,
  ): SetCharacterHelloCommand {
    return new SetCharacterHelloCommand(
      new Types.ObjectId(characterId),
      setCharacterHelloRequest.helloMessage,
      setCharacterHelloRequest.type,
    );
  }
}
