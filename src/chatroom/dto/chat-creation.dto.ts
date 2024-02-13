export class ChatCreationDTO {
  characterId: string; //id of the owner of chat

  content: string[]; //the actual content

  imgUrl: string[]; //urls of img

  timeToSend: Date; //time to send the chat
}
