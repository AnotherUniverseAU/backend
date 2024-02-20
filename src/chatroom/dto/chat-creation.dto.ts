import { Types } from 'mongoose';

export class ChatCreationDTO {
  characterId: Types.ObjectId; //id of the owner of chat

  content: string[]; //the actual content

  imgUrl: string[]; //urls of img

  timeToSend: Date; //time to send the chat

  constructor(
    characterId: Types.ObjectId,
    content: string[],

    timeToSend: Date,
  ) {
    this.characterId = characterId;
    this.content = content;
    this.timeToSend = timeToSend;
    //imgUrl is added afterwards
    this.imgUrl = [];
  }
}
