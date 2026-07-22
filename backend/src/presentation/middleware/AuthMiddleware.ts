import { FastifyReply, FastifyRequest } from 'fastify'
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult, JWTPayload } from 'jose'

const PUBLIC_PATHS = new Set(['/health'])

const PUBLIC_GET_PREFIXES = ['/api/v1/motos', '/api/v2/motos']

const keycloakUrl = process.env.KEYCLOAK_URL ?? 'http://localhost:8080'
const keycloakRealm = process.env.KEYCLOAK_REALM ?? 'moto-rental'

const JWKS = createRemoteJWKSet(
  new URL(`${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`),
)

const ISSUER = `${keycloakUrl}/realms/${keycloakRealm}`

interface KeycloakJWTPayload extends JWTPayload {
  email?: string
  realm_access?: { roles: string[] }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (PUBLIC_PATHS.has(request.url)) return
  if (['GET', 'HEAD'].includes(request.method) && PUBLIC_GET_PREFIXES.some(p => request.url.startsWith(p))) return

  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return void reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Bearer token requis' },
    })
  }

  const token = authHeader.slice(7)

  let result: JWTVerifyResult<KeycloakJWTPayload>
  try {
    result = await jwtVerify<KeycloakJWTPayload>(token, JWKS, { issuer: ISSUER })
  } catch {
    return void reply.status(401).send({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token invalide ou expiré' },
    })
  }

  const { payload } = result
  request.user = {
    id: payload.sub ?? '',
    email: payload.email ?? '',
    roles: payload.realm_access?.roles ?? [],
  }
}
