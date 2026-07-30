import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { reservationRoutesV1 } from '@presentation/routes/v1/reservations.routes'
import { IReservationRepository } from '@domain/repositories/IReservationRepository'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { IPaymentGateway } from '@domain/repositories/IPaymentGateway'
import { Reservation } from '@domain/entities/Reservation'
import { customerSummary, motoSummary, shopSummary } from '../../../helpers/reservation-fixtures'

/**
 * Test de route (et non de cas d'usage) : il existe pour verrouiller le
 * *câblage HTTP* du téléchargement de contrat.
 *
 * Régression couverte : dans un handler `async`, `reply.send(stream)` sans
 * `return` fait résoudre la promesse du handler avec `undefined`, et Fastify
 * écrase le stream déjà attaché. La réponse partait alors en 200
 * `application/pdf` avec un corps **vide** — un défaut qu'aucun test du cas
 * d'usage ne peut voir, puisque celui-ci renvoyait bien la bonne référence de
 * fichier. D'où l'assertion sur la taille réelle du corps.
 */

const RESERVATION_ID = '748b0ba5-5d32-4c5a-ac67-89dc792c8a4f'
const MISSING_FILE_RESERVATION_ID = '00000000-0000-4000-8000-0000000000ff'
const STRANGER_ID = '00000000-0000-4000-8000-000000000999'

// Le worker écrit dans ce répertoire via un volume partagé ; la route le lit
// depuis le cwd du process (cf. CONTRACTS_DIR dans reservations.routes.ts).
const CONTRACTS_DIR = join(process.cwd(), 'uploads', 'contracts')
const PDF_BYTES = Buffer.from('%PDF-1.3\n% contrat de test\n%%EOF\n')

function makeReservation(id: string, contractStatus: string): Reservation {
  return new Reservation(
    id,
    motoSummary.id,
    customerSummary.id,
    '2026-08-01',
    '2026-08-05',
    340,
    500,
    'pending',
    'pending',
    new Date(),
    motoSummary,
    customerSummary,
    contractStatus,
    undefined,
    shopSummary,
  )
}

const reservationRepository: IReservationRepository = {
  findAll: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(async (id: string) =>
    id === RESERVATION_ID || id === MISSING_FILE_RESERVATION_ID
      ? makeReservation(id, 'ready')
      : null,
  ),
  findMotoPricePerDay: jest.fn(),
  hasActiveOverlap: jest.fn(),
  ensureCustomer: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateContract: jest.fn(),
}

const paymentRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
  refund: jest.fn(),
} as IPaymentRepository

const paymentGateway = {
  createCheckoutSession: jest.fn(),
  retrieveCheckoutSession: jest.fn(),
} as IPaymentGateway

/** Identité injectée à la place d'authMiddleware — aucun Keycloak requis. */
let currentUser: FastifyRequest['user']

async function buildApp(): Promise<FastifyInstance> {
  const app = fastify()

  app.addHook('preHandler', async (request: FastifyRequest) => {
    request.user = currentUser
  })

  await app.register(reservationRoutesV1, {
    reservationRepository,
    paymentRepository,
    paymentGateway,
  })

  await app.ready()
  return app
}

describe('GET /reservations/:id/contract', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    await mkdir(CONTRACTS_DIR, { recursive: true })
    await writeFile(join(CONTRACTS_DIR, `${RESERVATION_ID}.pdf`), PDF_BYTES)
    app = await buildApp()
  })

  afterAll(async () => {
    await rm(join(CONTRACTS_DIR, `${RESERVATION_ID}.pdf`), { force: true })
    await app.close()
  })

  beforeEach(() => {
    currentUser = {
      id: customerSummary.id,
      email: customerSummary.email,
      roles: ['customer'],
    }
  })

  it('should stream the whole PDF to the customer who owns the reservation', async () => {
    const response = await app.inject({ method: 'GET', url: `/reservations/${RESERVATION_ID}/contract` })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('application/pdf')
    expect(response.headers['content-disposition']).toContain(`contrat-${RESERVATION_ID}.pdf`)

    // Le cœur de la régression : un corps vide passerait toutes les
    // assertions précédentes.
    expect(response.rawPayload.length).toBe(PDF_BYTES.length)
    expect(response.rawPayload.subarray(0, 5).toString()).toBe('%PDF-')
  })

  it('should let an administrator download any contract', async () => {
    currentUser = { id: 'admin-1', email: 'admin@mail.com', roles: ['admin'] }

    const response = await app.inject({ method: 'GET', url: `/reservations/${RESERVATION_ID}/contract` })

    expect(response.statusCode).toBe(200)
    expect(response.rawPayload.length).toBeGreaterThan(0)
  })

  it('should reject a customer asking for someone else contract', async () => {
    currentUser = { id: STRANGER_ID, email: 'stranger@example.com', roles: ['customer'] }

    const response = await app.inject({ method: 'GET', url: `/reservations/${RESERVATION_ID}/contract` })

    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('FORBIDDEN')
  })

  it('should reject an anonymous request', async () => {
    currentUser = undefined

    const response = await app.inject({ method: 'GET', url: `/reservations/${RESERVATION_ID}/contract` })

    expect(response.statusCode).toBe(401)
  })

  it('should return 404 when the reservation is unknown', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/reservations/11111111-1111-4111-8111-111111111111/contract',
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 404 when the file vanished from the shared volume', async () => {
    currentUser = { id: 'admin-1', email: 'admin@mail.com', roles: ['admin'] }

    const response = await app.inject({
      method: 'GET',
      url: `/reservations/${MISSING_FILE_RESERVATION_ID}/contract`,
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.message).toContain('stockage')
  })

  it('should reject a malformed reservation id', async () => {
    const response = await app.inject({ method: 'GET', url: '/reservations/pas-un-uuid/contract' })

    expect(response.statusCode).toBe(400)
  })
})
