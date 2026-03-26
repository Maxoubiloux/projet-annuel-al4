export class Shop {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly address: string,
    readonly city: string,
    readonly zipCode: string,
    readonly country: string,
    readonly phone: string,
    readonly email: string,
    readonly createdAt: Date
  ) { }
}
