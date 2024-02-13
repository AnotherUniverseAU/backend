export class SubscriptionEventDTO {
  constructor(
    readonly userId: string,
    readonly characterId: string,
    readonly subscriptionId: string,
  ) {}
}
