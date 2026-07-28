import { ContractGenerationRequest } from '@domain/ports/IContractQueuePublisher'

/**
 * Contrat d'échange Backend <-> Worker sur les files RabbitMQ.
 *
 * Le format "wire" est en snake_case pour rester idiomatique côté worker Rust
 * (serde) et cohérent avec worker/README.md. Ces types sont volontairement
 * un miroir 1:1 du JSON transmis — voir ADR 0005. Toute évolution doit être
 * synchronisée avec l'équipe Worker.
 */

export const CONTRACT_JOB_TYPE = 'GenerateRentalContractPdf' as const

/** Message publié par le backend sur la file de demandes (backend -> worker). */
export interface ContractJobRequest {
  correlation_id: string
  job_type: typeof CONTRACT_JOB_TYPE
  reservation_id: string
  data: {
    moto_id: string
    customer_id: string
    start_date: string
    end_date: string
    total_amount: number
    deposit_amount: number
  }
}

/** Message publié par le worker sur la file de réponses (worker -> backend). */
export interface ContractJobResponse {
  correlation_id: string
  reservation_id: string
  success: boolean
  /** Présent quand success === true : URL du contrat PDF généré. */
  url?: string
  /** Présent quand success === false : raison de l'échec. */
  error?: string
}

/** Traduit une demande métier vers le message d'échange (wire format). */
export function toContractJobRequest(request: ContractGenerationRequest): ContractJobRequest {
  return {
    correlation_id: request.correlationId,
    job_type: CONTRACT_JOB_TYPE,
    reservation_id: request.reservation.id,
    data: {
      moto_id: request.reservation.motoId,
      customer_id: request.reservation.customerId,
      start_date: request.reservation.startDate,
      end_date: request.reservation.endDate,
      total_amount: request.reservation.totalAmount,
      deposit_amount: request.reservation.depositAmount,
    },
  }
}

/**
 * Valide et normalise un message brut reçu sur la file de réponses.
 * Retourne null si le message est invalide (déclenchera un nack -> DLQ).
 */
export function parseContractJobResponse(raw: unknown): ContractJobResponse | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.reservation_id !== 'string' || r.reservation_id.length === 0) return null
  if (typeof r.success !== 'boolean') return null
  if (r.success && typeof r.url !== 'string') return null
  return {
    correlation_id: typeof r.correlation_id === 'string' ? r.correlation_id : '',
    reservation_id: r.reservation_id,
    success: r.success,
    url: typeof r.url === 'string' ? r.url : undefined,
    error: typeof r.error === 'string' ? r.error : undefined,
  }
}
