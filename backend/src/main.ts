import fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { authMiddleware } from '@presentation/middleware/AuthMiddleware'
import v1Routes from '@presentation/routes/v1'
import v2Routes from '@presentation/routes/v2'
import { PrismaMotoRepository } from '@infrastructure/db/prisma-moto.repository'

const motoRepository = new PrismaMotoRepository()

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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
})

app.get('/health', async () => ({ status: 'ok' }))

app.addHook('preHandler', authMiddleware)

app.register(v1Routes, { prefix: '/api/v1', motoRepository })
app.register(v2Routes, { prefix: '/api/v2' })

// app.setErrorHandler((error, request, reply) => {
//   request.log.error(error)
//   reply.status(error.statusCode || 500).send({
//     error: error.message || 'Internal Server Error',
//     correlationId: request.id,
//   })
// })

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Backend started on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
