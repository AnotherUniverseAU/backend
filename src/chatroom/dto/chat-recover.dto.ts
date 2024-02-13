export class ChatRecoverDTO {
  readonly characterIds: string[]; //ids of the subscribed characters
  readonly timestamp: Date; //the last timestamp of the received chat : you have to save this at the local device
}
