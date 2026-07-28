import {
  Reservation,
  ReservationCustomerSummary,
  ReservationMotoSummary,
  ReservationShopSummary,
} from '@domain/entities/Reservation'

/**
 * Fixtures partagées par les specs qui vérifient la publication du job de
 * contrat : le repository Prisma renvoie toujours une réservation *hydratée*
 * (moto, client, agence), et c'est cette hydratation qui alimente le message
 * envoyé au worker isolé.
 */

export const customerSummary: ReservationCustomerSummary = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  firstName: 'Camille',
  lastName: 'Durand',
  phone: '+33600000000',
  email: 'camille.durand@example.com',
}

export const motoSummary: ReservationMotoSummary = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  brand: 'Yamaha',
  model: 'MT-07',
  plate: 'AB-123-CD',
  category: 'Roadster',
}

export const shopSummary: ReservationShopSummary = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  name: 'Plein Gaz Loc',
  city: 'Paris',
}

/** Simule ce que renvoie `PrismaReservationRepository.save()` : l'entité + ses relations. */
export function hydrate(reservation: Reservation): Reservation {
  return new Reservation(
    reservation.id,
    reservation.motoId,
    reservation.customerId,
    reservation.startDate,
    reservation.endDate,
    reservation.totalAmount,
    reservation.depositAmount,
    reservation.status,
    reservation.paymentStatus,
    reservation.createdAt,
    motoSummary,
    customerSummary,
    reservation.contractStatus,
    reservation.contractPdfUrl,
    shopSummary,
  )
}
