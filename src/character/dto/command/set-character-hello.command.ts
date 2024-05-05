import { Types } from 'mongoose';
import { SetHelloRequest as SetCharacterHelloRequest } from '../request/set-hello.request';

export class SetCharacterHelloCommand {
  constructor(
    public readonly characterId: Types.ObjectId,
    public readonly helloMessage: string[],
    public readonly type: string,
  ) {}

  static from_request(
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
