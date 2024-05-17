import { UpdateWriteOpResult } from 'mongoose';
import { Types } from 'mongoose';

export class SetCharacterHelloResponse {
  constructor(
    readonly message: string,
    //scattered helloMessages. ex) {...helloMessage}
    readonly helloMessages: object,
    readonly result: {
      acknowledged: boolean;
      modifiedCount: number;
      upsertedId: Types.ObjectId;
      upsertedCount: number;
      matchedCount: number;
    },
  ) {}

  static fromResult(helloMessage: string[], result: UpdateWriteOpResult) {
    const resultResponse = {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
    };

    if (result.acknowledged) {
      return new SetCharacterHelloResponse(
        'hello message set',
        { ...helloMessage },
        resultResponse,
      );
    } else {
      return new SetCharacterHelloResponse(
        'hello message set failed',
        { ...helloMessage },
        resultResponse,
      );
    }
  }
}
