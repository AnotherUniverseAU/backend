import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Observable } from 'rxjs';
import { UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ChangeLastAccessInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const characterId = request.params.characterId;

    const user = request.user as UserDocument;

    user.lastAccess = new Date();

    if (
      characterId &&
      !user.subscribedCharacters.includes(new Types.ObjectId(characterId))
    )
      throw new HttpException('user not subscribed to character', 401);

    const chatRoomData = user.chatRoomDatas.get(characterId);

    if (method === 'POST') {
      const userReply = request.body.userReply
        ? request.body.userReply
        : '사진';
      chatRoomData.lastChat = userReply;
      chatRoomData.lastChatDate = new Date();
    }
    chatRoomData.unreadCounts = 0;
    chatRoomData.lastAccess = new Date();

    user.chatRoomDatas.set(characterId, chatRoomData);
    await user.save();

    return next.handle();
  }
}
