import { join } from 'path'
import fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { authMiddleware } from '@presentation/middleware/AuthMiddleware'
import v1Routes from '@presentation/routes/v1'
import v2Routes from '@presentation/routes/v2'
import { PrismaMotoRepository } from '@infrastructure/db/prisma-moto.repository'
import { PrismaShopRepository } from '@infrastructure/db/prisma-shop.repository'
import { PrismaBrandRepository } from '@infrastructure/db/prisma-brand.repository'
import { PrismaReservationRepository } from '@infrastructure/db/prisma-reservation.repository'
import { PrismaCustomerRepository } from '@infrastructure/db/prisma-customer.repository'
import { PrismaMaintenanceRepository } from '@infrastructure/db/prisma-maintenance.repository'
import { PrismaPaymentRepository } from '@infrastructure/db/prisma-payment.repository'
import { PrismaSettingsRepository } from '@infrastructure/db/prisma-settings.repository'
import { PrismaDashboardRepository } from '@infrastructure/db/prisma-dashboard.repository'
import { KeycloakAdminClient } from '@infrastructure/external/keycloak-admin.client'
import { RabbitMqConnection } from '@infrastructure/queues/rabbitmq.connection'
import { RabbitMqContractPublisher } from '@infrastructure/queues/rabbitmq-contract.publisher'
import { startWorkerResponseConsumer } from '@infrastructure/queues/worker-response.consumer'

const motoRepository = new PrismaMotoRepository()
const shopRepository = new PrismaShopRepository()
const brandRepository = new PrismaBrandRepository()
const reservationRepository = new PrismaReservationRepository()
const customerRepository = new PrismaCustomerRepository()
const maintenanceRepository = new PrismaMaintenanceRepository()
const paymentRepository = new PrismaPaymentRepository()
const settingsRepository = new PrismaSettingsRepository()
const dashboardRepository = new PrismaDashboardRepository()
const iamClient = new KeycloakAdminClient()

// File de messages : la connexion est établie au démarrage (voir start()).
// Le publisher est toujours injecté ; en l'absence de broker joignable, la
// publication échoue de façon isolée sans bloquer la création de réservation.
const rabbitConnection = new RabbitMqConnection()
const contractPublisher = new RabbitMqContractPublisher(rabbitConnection)

const app = fastify({
  logger: process.env.NODE_ENV === 'production'
    ? true
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      },
})

await app.register(helmet)
await app.register(cors, {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(','),
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

await app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
})

// /uploads/* is exempted from authMiddleware's global preHandler hook (see
// PUBLIC_PREFIXES in AuthMiddleware.ts) so images stay reachable via plain
// <img> tags, which never send an Authorization header.
await app.register(fastifyStatic, {
  root: join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  setHeaders: (res) => {
    // helmet's default Cross-Origin-Resource-Policy is same-origin, which
    // would block the admin app (different origin) from rendering these.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  },
})

app.get('/health', async () => ({ status: 'ok' }))

app.addHook('preHandler', authMiddleware)

app.register(v1Routes, {
  prefix: '/api/v1',
  motoRepository,
  shopRepository,
  brandRepository,
  reservationRepository,
  customerRepository,
  maintenanceRepository,
  paymentRepository,
  settingsRepository,
  dashboardRepository,
  iamClient,
  contractPublisher,
})
app.register(v2Routes, { prefix: '/api/v2' })

// app.setErrorHandler((error, request, reply) => {
//   request.log.error(error)
//   reply.status(error.statusCode || 500).send({
//     error: error.message || 'Internal Server Error',
//     correlationId: request.id,
//   })
// })

const start = async () => {
  // Connexion à RabbitMQ + démarrage du consumer de réponses worker. Non
  // bloquant : si le broker est indisponible (dev sans RabbitMQ), on loggue un
  // avertissement et l'API démarre quand même.
  try {
    await rabbitConnection.connect(app.log)
    await startWorkerResponseConsumer(rabbitConnection, reservationRepository, app.log)
    app.log.info('RabbitMQ connected — worker queues ready')
  } catch (err) {
    app.log.warn({ err }, 'RabbitMQ unavailable — worker queue features disabled')
  }

  // Arrêt gracieux : ferme proprement le canal et la connexion RabbitMQ.
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void rabbitConnection.close().catch(() => {})
      void app.close().finally(() => process.exit(0))
    })
  }

  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Backend started on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
