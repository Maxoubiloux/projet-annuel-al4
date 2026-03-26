export class Booking {
  constructor(
    readonly id: string,
    readonly motoId: string,
    readonly userId: string,
    readonly shopId: string,
    readonly startDate: Date,
    readonly endDate: Date,
    readonly createdAt: Date
  ) { }
}
