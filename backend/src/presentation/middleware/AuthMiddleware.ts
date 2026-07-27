import { FastifyReply, FastifyRequest } from 'fastify'
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult, JWTPayload } from 'jose'

const PUBLIC_PATHS = new Set(['/health'])

const PUBLIC_AUTH_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
])
const PUBLIC_GET_PREFIXES = ['/api/v1/motos', '/api/v2/motos']

const keycloakUrl = process.env.KEYCLOAK_URL ?? 'http://localhost:8080'
const keycloakIssuerUrl = process.env.KEYCLOAK_ISSUER_URL ?? keycloakUrl
const keycloakRealm = process.env.KEYCLOAK_REALM ?? 'moto-rental'

const JWKS = createRemoteJWKSet(
  new URL(`${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`),
)

const ISSUERS = Array.from(new Set([
  `${keycloakIssuerUrl}/realms/${keycloakRealm}`,
  `${keycloakUrl}/realms/${keycloakRealm}`,
]))

interface KeycloakJWTPayload extends JWTPayload {
  email?: string
  given_name?: string
  family_name?: string
  realm_access?: { roles: string[] }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const path = request.url.split('?')[0]
  if (PUBLIC_PATHS.has(path)) return
  if (PUBLIC_AUTH_PATHS.has(path)) return
  if (['GET', 'HEAD'].includes(request.method) && PUBLIC_GET_PREFIXES.some(p => path.startsWith(p))) return

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
    result = await jwtVerify<KeycloakJWTPayload>(token, JWKS, { issuer: ISSUERS })
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
    firstName: payload.given_name,
    lastName: payload.family_name,
    roles: payload.realm_access?.roles ?? [],
  }
}
