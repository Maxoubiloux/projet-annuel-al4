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

/** Identité du locataire, telle que rendue sur le contrat PDF. */
export interface ContractCustomerData {
  first_name: string
  last_name: string
  email: string
  phone: string
}

/** Véhicule loué, tel que rendu sur le contrat PDF. */
export interface ContractMotoData {
  brand: string
  model: string
  plate: string
  category?: string
}

/** Agence émettrice, telle que rendue sur le contrat PDF. */
export interface ContractShopData {
  name: string
  city: string
}

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
    /**
     * Blocs dénormalisés : le worker n'a aucun accès à la base, tout ce qui
     * doit apparaître sur le contrat transite ici. Optionnels côté wire — le
     * worker retombe sur les identifiants si un bloc est absent, ce qui rend
     * les déploiements backend/worker indépendants.
     */
    customer?: ContractCustomerData
    moto?: ContractMotoData
    shop?: ContractShopData
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
  const { reservation } = request

  return {
    correlation_id: request.correlationId,
    job_type: CONTRACT_JOB_TYPE,
    reservation_id: reservation.id,
    data: {
      moto_id: reservation.motoId,
      customer_id: reservation.customerId,
      start_date: reservation.startDate,
      end_date: reservation.endDate,
      total_amount: reservation.totalAmount,
      deposit_amount: reservation.depositAmount,
      ...(reservation.customer && {
        customer: {
          first_name: reservation.customer.firstName,
          last_name: reservation.customer.lastName,
          email: reservation.customer.email,
          phone: reservation.customer.phone,
        },
      }),
      ...(reservation.moto && {
        moto: {
          brand: reservation.moto.brand,
          model: reservation.moto.model,
          plate: reservation.moto.plate,
          ...(reservation.moto.category && { category: reservation.moto.category }),
        },
      }),
      ...(reservation.shop && {
        shop: {
          name: reservation.shop.name,
          city: reservation.shop.city,
        },
      }),
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
