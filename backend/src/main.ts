import { join } from 'path'
import fastify from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { authMiddleware } from '@presentation/middleware/AuthMiddleware'
import { errorHandler, notFoundHandler } from '@presentation/middleware/error-handler'
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
import { PrismaFavoriteRepository } from '@infrastructure/db/prisma-favorite.repository'
import { KeycloakAdminClient } from '@infrastructure/external/keycloak-admin.client'
import { RabbitMqConnection } from '@infrastructure/queues/rabbitmq.connection'
import { RabbitMqContractPublisher } from '@infrastructure/queues/rabbitmq-contract.publisher'
import { startWorkerResponseConsumer } from '@infrastructure/queues/worker-response.consumer'
import { StripePaymentGateway } from '@infrastructure/external/stripe-payment.gateway'
import { UnavailablePaymentGateway } from '@infrastructure/external/unavailable-payment.gateway'

const motoRepository = new PrismaMotoRepository()
const shopRepository = new PrismaShopRepository()
const brandRepository = new PrismaBrandRepository()
const reservationRepository = new PrismaReservationRepository()
const customerRepository = new PrismaCustomerRepository()
const maintenanceRepository = new PrismaMaintenanceRepository()
const paymentRepository = new PrismaPaymentRepository()
const settingsRepository = new PrismaSettingsRepository()
const dashboardRepository = new PrismaDashboardRepository()
const favoriteRepository = new PrismaFavoriteRepository()
const iamClient = new KeycloakAdminClient()
const paymentGateway = process.env.STRIPE_SECRET_KEY
  ? new StripePaymentGateway(process.env.STRIPE_SECRET_KEY)
  : new UnavailablePaymentGateway()

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
  genReqId: (req) => (req.headers['x-correlation-id'] as string) || uuidv4(),
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

app.addHook('onSend', async (request, reply, payload) => {
  reply.header('X-Correlation-Id', request.id)
  return payload
})

await app.register(fastifyStatic, {
  root: join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  setHeaders: (res) => {
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
  paymentGateway,
  settingsRepository,
  dashboardRepository,
  favoriteRepository,
  iamClient,
  contractPublisher,
})
app.register(v2Routes, { prefix: '/api/v2', motoRepository })

app.setErrorHandler(errorHandler)
app.setNotFoundHandler(notFoundHandler)

const start = async () => {
  try {
    await rabbitConnection.connect(app.log)
    await startWorkerResponseConsumer(rabbitConnection, reservationRepository, app.log)
    app.log.info('RabbitMQ connected — worker queues ready')
  } catch (err) {
    app.log.warn({ err }, 'RabbitMQ unavailable — worker queue features disabled')
  }

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void rabbitConnection.close().catch(() => { })
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
