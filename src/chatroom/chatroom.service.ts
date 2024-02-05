import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CharacterChatRepository } from 'src/repository/character-chat.repository';
import { UserDocument } from 'src/schemas/user.schema';
import { ChatRecoverDTO } from './dto/chat-recover.dto';
import {
  CharacterChat,
  CharacterChatDocument,
  ChatLog,
} from 'src/schemas/character-chat.schema';
import { ChatCreationDTO } from './dto/chat-creation.dto';

@Injectable()
export class ChatRoomService {
  constructor(private characterChatRepo: CharacterChatRepository) {}

  //checked
  async recoverChat(
    user: UserDocument,
    payload: ChatRecoverDTO,
  ): Promise<Record<string, ChatLog[]>> {
    const { characterIds, timestamp } = payload;
    console.log('requesting ', characterIds);
    //check if requested characterIds are valid
    const validatedCharacterIds = this.validateRecoverRequest(
      user,
      characterIds,
    );
    console.log('retrieving from :', validatedCharacterIds);
    //retrieve chat logs based on characterId
    const chatDict = await this.retrieveChat(validatedCharacterIds, timestamp);
    return chatDict;
  }

  async createChat(payload: ChatCreationDTO): Promise<CharacterChatDocument> {
    const characterChat = await this.characterChatRepo.findOrCreate(payload);
    return characterChat;
  }

  private validateRecoverRequest(user: UserDocument, characterIds: string[]) {
    const subscribedCharacters = user.subscribedCharacters.map((id) =>
      id.toString(),
    );
    //check if user request is valid, not requesting any additional character
    const validatedCharacters = subscribedCharacters.filter((characterId) => {
      return characterIds.includes(characterId);
    });

    if (!validatedCharacters) {
      throw new WsException(
        'Invalid character request, you have no matching subscription',
      );
    }

    return validatedCharacters;
  }

  private async retrieveChat(
    validatedCharacterIds: string[],
    timestamp: Date,
  ): Promise<Record<string, ChatLog[]>> {
    const dictionary: Record<string, ChatLog[]> = {};

    await Promise.all(
      validatedCharacterIds.map(async (id) => {
        const characterChat = await this.characterChatRepo.findByIdAndTime(
          id,
          timestamp,
        );
        dictionary[id] = characterChat;
      }),
    );

    return dictionary;
  }
}
