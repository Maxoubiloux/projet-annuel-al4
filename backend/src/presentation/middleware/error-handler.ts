import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import {
  DomainError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '@shared/errors/DomainError'

/**
 * Traduit une erreur métier (DomainError) en code HTTP.
 * Fonction pure — testable sans Fastify. La couche domaine ne connaît jamais
 * les codes HTTP (cf. backend/CLAUDE.md), la traduction vit donc ici.
 */
export function mapDomainErrorToStatus(error: DomainError): number {
  if (error instanceof ValidationError) return 400
  if (error instanceof NotFoundError) return 404
  if (error instanceof UnauthorizedError) return 401
  if (error instanceof ForbiddenError) return 403
  // InternalServerError et tout DomainError inconnu
  return 500
}

interface ErrorEnvelope {
  success: false
  error: { code: string; message: string }
}

/**
 * Handler d'erreur centralisé Fastify. Toute exception non gérée retombe sur
 * l'enveloppe standard `{ success:false, error:{ code, message } }`
 * documentée dans backend/CLAUDE.md, au lieu de la réponse brute de Fastify.
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // Si la réponse a déjà commencé (streaming/partiel), on ne peut plus la réécrire.
  if (reply.sent) return

  const { status, code } = classifyError(error)

  // On ne fuite jamais le détail interne d'une 5xx (message Prisma, stack, secrets…).
  const message = status >= 500 ? 'Internal Server Error' : error.message

  // Niveau de log aligné sur backend/CLAUDE.md : `error` réservé aux 5xx (échec
  // définitif), `warn` pour les erreurs client 4xx (bruit métier attendu).
  const logPayload = { err: error, correlationId: request.id }
  if (status >= 500) {
    request.log.error(logPayload, 'Unhandled error')
  } else {
    request.log.warn(logPayload, 'Client error')
  }

  const body: ErrorEnvelope = { success: false, error: { code, message } }
  reply.status(status).send(body)
}

/**
 * Détermine le couple (status HTTP, code métier) d'une erreur, par ordre de
 * priorité : DomainError typée → validation Fastify → statusCode HTTP explicite
 * (<500) → fallback technique 500.
 */
function classifyError(error: FastifyError): { status: number; code: string } {
  if (error instanceof DomainError) {
    return { status: mapDomainErrorToStatus(error), code: error.code }
  }
  if (error.validation) {
    return { status: 400, code: 'VALIDATION_ERROR' }
  }
  if (typeof error.statusCode === 'number' && error.statusCode < 500) {
    return { status: error.statusCode, code: error.code ?? 'BAD_REQUEST' }
  }
  return { status: 500, code: 'INTERNAL_SERVER_ERROR' }
}

/**
 * Handler 404 centralisé : une route inconnue renvoie l'enveloppe standard
 * plutôt que le 404 par défaut de Fastify.
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  const body: ErrorEnvelope = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} introuvable`,
    },
  }
  reply.status(404).send(body)
}
