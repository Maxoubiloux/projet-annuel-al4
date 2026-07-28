import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllReservationsUseCase } from '@domain/usecases/get-all-reservations.usecase'
import { GetRecentReservationsUseCase } from '@domain/usecases/get-recent-reservations.usecase'
import { Reservation } from '@domain/entities/Reservation'

interface ReservationsQuery {
  page?: string
  limit?: string
  sort?: string
  customerId?: string
}

/**
 * GET /reservations est consommé par deux écrans avec des shapes différentes :
 * la page Reservations (liste paginée imbriquée) et le Dashboard (résumé aplati
 * des 5 dernières réservations, appelé avec ?sort=-createdAt). On distingue les
 * deux via la présence du paramètre `sort`, pour ne pas avoir à changer le front.
 */
function toDashboardShape(r: Reservation) {
  const start = new Date(r.startDate)
  const end = new Date(r.endDate)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))

  let status: 'active' | 'pending' | 'done' | 'overdue'
  if (r.status === 'pending') status = 'pending'
  else if (r.status === 'completed' || r.status === 'cancelled') status = 'done'
  else if (r.status === 'in_progress' && end.getTime() < Date.now()) status = 'overdue'
  else status = 'active'

  return {
    id: r.id,
    customer: r.customer ? `${r.customer.firstName} ${r.customer.lastName}`.trim() : '',
    moto: r.moto ? `${r.moto.brand} ${r.moto.model}` : '',
    period: `${r.startDate} → ${r.endDate}`,
    days,
    amount: `${r.totalAmount}€`,
    status,
  }
}

export class GetReservationsController {
  constructor(
    private readonly getAllReservationsUseCase: GetAllReservationsUseCase,
    private readonly getRecentReservationsUseCase: GetRecentReservationsUseCase,
  ) { }

  async handle(request: FastifyRequest<{ Querystring: ReservationsQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /reservations')

    if (request.query.sort !== undefined) {
      const limit = request.query.limit ? Number(request.query.limit) : 5
      const recent = await this.getRecentReservationsUseCase.execute(limit)
      reply.send({ success: true, data: recent.map(toDashboardShape) })
      return
    }

    const page = request.query.page ? Number(request.query.page) : 1
    const limit = request.query.limit ? Number(request.query.limit) : 10
    const customerId = request.query.customerId
    const { items, total } = await this.getAllReservationsUseCase.execute({ page, limit, customerId })

    reply.send({
      success: true,
      data: items,
      meta: { total, page, limit },
    })
  }
}
