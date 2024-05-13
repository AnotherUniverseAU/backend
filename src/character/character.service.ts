import { Injectable } from '@nestjs/common';
import { Types, UpdateWriteOpResult } from 'mongoose';
import { CharacterRepository } from 'src/repository/character.repository';
import { CharacterCreationRepository } from 'src/repository/character-creation.repository';
import { CharacterDTO } from './dto/character.dto';
import { Character, CharacterCreation, CharacterReport } from './dto/domain';
import { UserService } from 'src/user/user.service';
import nicknameModifier from '../global/nickname-modifier';
import {
  CharacterCreationCommand,
  GetSubscribedCharacterInfoCommand,
  SetCharacterHelloCommand,
  SaveCharacterReportCommand,
} from './dto/command';
import { User } from 'src/user/dto/domain/user';

@Injectable()
export class CharacterService {
  constructor(
    private characterRepo: CharacterRepository,
    private characterCreationRepo: CharacterCreationRepository,
    private userService: UserService,
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

  async getCharacterHello(characterId: Types.ObjectId, user: User) {
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

    await this.userService.setChatRoomData(user._id, characterId, chatRoomData);

    const nickname = chatRoomData.nickname
      ? chatRoomData.nickname
      : user.nickname;
    const userSpecificHello = helloMessage.map((chat) => {
      return nicknameModifier(nickname, chat);
    });

    return { userSpecificHello, character };
  }

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

    await this.characterRepo.update(character);
  }

  async getCharacterPictureAndName(
    ids: Types.ObjectId[],
  ): Promise<Partial<CharacterDTO>[]> {
    const characters = await this.characterRepo.findByIds(ids);
    const nameAndPic = characters.map((character) =>
      new CharacterDTO(character).toNameAndPic(),
    );
    return nameAndPic;
  }

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

    if (characterReport.complainment === '')
      characterReport.complainment = '비어있음';

    // const characterReport = await this.characterRepo.createCharacterReport(
    //   new Types.ObjectId(characterId),
    //   userId,
    //   complainment,
    // );

    return await this.characterRepo.createCharacterReport(characterReport);
  }
}
