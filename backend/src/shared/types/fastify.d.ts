import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string      // Keycloak sub
      email: string
      firstName?: string
      lastName?: string
      roles: string[]
    }
  }
}
