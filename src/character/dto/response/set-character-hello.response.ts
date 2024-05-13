import { UpdateWriteOpResult } from 'mongoose';

export class SetCharacterHelloResponse {
  constructor(
    readonly message: string,
    readonly helloMessages: string[],
    readonly result: UpdateWriteOpResult,
  ) {}

  static fromResult(helloMessage: string[], result: UpdateWriteOpResult) {
    if (result.acknowledged) {
      return new SetCharacterHelloResponse(
        'hello message set',
        { ...helloMessage },
        result,
      );
    } else {
      return new SetCharacterHelloResponse(
        'hello message set failed',
        { ...helloMessage },
        result,
      );
    }
  }
}
