import { Injectable } from '@nestjs/common';
import { Types, UpdateWriteOpResult } from 'mongoose';
import { CharacterRepository } from 'src/repository/character.repository';
import { CharacterCreationRepository } from 'src/repository/character-creation.repository';
import { Character, CharacterCreation, CharacterReport } from './dto/domain';
import nicknameModifier from '../global/nickname-modifier';
import {
  CharacterCreationCommand,
  GetSubscribedCharacterInfoCommand,
  SetCharacterHelloCommand,
  SaveCharacterReportCommand,
} from './dto/command';
import { User as UserDomain } from 'src/user/dto/domain/user';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CharacterService {
  constructor(
    private characterRepo: CharacterRepository,
    private characterCreationRepo: CharacterCreationRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllCharacters(): Promise<Character[]> {
    const characters = await this.characterRepo.findAll();
    return characters;
  }

  async getCharacterInfo(characterId: string): Promise<Character> {
    const character = await this.characterRepo.findById(characterId);
    return character;
  }

  async getMainCharacter(): Promise<Character> {
    const mainCharacter = await this.characterRepo.findMainCharacter();
    return mainCharacter;
  }

  async getCharacterHello(
    characterId: Types.ObjectId,
    user: UserDomain,
  ): Promise<{ userSpecificHello: any[]; character: Character }> {
    const character = await this.characterRepo.findById(characterId);
    const chatRoomData = user.chatRoomDatas.get(characterId.toString());

    const { helloMessageDay, helloMessageNight } = character;
    let helloMessage: string[];
    const subscriptionStartTimeLocal = chatRoomData.createdDate.getTime() + 9;
    if (subscriptionStartTimeLocal > 2 && subscriptionStartTimeLocal < 7)
      helloMessage = helloMessageNight;
    else helloMessage = helloMessageDay;

    if (!chatRoomData.lastChatDate) {
      chatRoomData.lastChatDate = new Date();
      chatRoomData.unreadCounts = 0;
      chatRoomData.lastAccess = new Date();
      chatRoomData.lastChat = helloMessage[helloMessage.length - 1].includes(
        'https:',
      )
        ? '사진'
        : helloMessage[helloMessage.length - 1];
    }

    this.eventEmitter.emit(
      'chatRoomDataUpdate',
      user._id,
      characterId,
      chatRoomData,
    );

    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;
    const userSpecificHello = helloMessage.map((chat) => {
      return nicknameModifier(nickname, chat);
    });

    return { userSpecificHello, character };
  }

  //현재 사용안함
  async createCharacter(characterData: any): Promise<Character> {
    const character = await this.characterRepo.create(characterData);
    return character;
  }

  async setCharacterHello(
    setCharacterHelloCommand: SetCharacterHelloCommand,
  ): Promise<UpdateWriteOpResult | null> {
    const { characterId, type, helloMessage } = setCharacterHelloCommand;

    const character = await this.characterRepo.findById(characterId);

    if (!character) {
      return null;
    }

    if (type === 'day') {
      character.helloMessageDay = helloMessage;
    } else if (type === 'night') {
      character.helloMessageNight = helloMessage;
    }

    return await this.characterRepo.updateHelloMessage(character);
  }

  // async getCharacterPictureAndName(
  //   ids: Types.ObjectId[],
  // ): Promise<Partial<CharacterDTO>[]> {
  //   const characters = await this.characterRepo.findByIds(ids);
  //   const nameAndPic = characters.map((character) =>
  //     new CharacterDTO(character).toNameAndPic(),
  //   );
  //   return nameAndPic;
  // }

  async saveCharacterCreationRequest(
    characterCreationCommand: CharacterCreationCommand,
  ): Promise<CharacterCreation> {
    const characterCreation = characterCreationCommand.toDomain();
    // const characterCreation = await this.characterCreationRepo.create(
    //   userId,
    //   characterCreationDTO,
    // );

    return await this.characterCreationRepo.create(characterCreation);
  }

  async getSubscribedCharacterInfo(
    getSubscribedCharacterInfoCommand: GetSubscribedCharacterInfoCommand,
  ): Promise<Character[]> {
    const { subscribedCharacters } = getSubscribedCharacterInfoCommand;
    const characters = await this.characterRepo.findByIds(subscribedCharacters);
    // const characterDTOs = characters.map((character) =>
    //   new CharacterDTO(character).toNameAndPic(),
    // );
    return characters;
  }

  async saveCharacterReport(
    saveCharacterReportCommand: SaveCharacterReportCommand,
  ): Promise<CharacterReport> {
    const characterReport = saveCharacterReportCommand.toDomain();
    // const characterReport = await this.characterRepo.createCharacterReport(
    //   new Types.ObjectId(characterId),
    //   userId,
    //   complainment,
    // );

    return await this.characterRepo.createCharacterReport(characterReport);
  }
}
