/**
 * Port domaine : publication d'une demande de génération de contrat de location
 * vers le worker (via une file de messages). Le domaine ne connaît ni RabbitMQ
 * ni le format de sérialisation — cf. règle d'isolation (backend/CLAUDE.md).
 *
 * L'entrée est décrite en termes métier (camelCase) ; la traduction vers le
 * format d'échange sur la file est la responsabilité de l'implémentation
 * d'infrastructure.
 */
import {
  ReservationCustomerSummary,
  ReservationMotoSummary,
  ReservationShopSummary,
} from '../entities/Reservation'

export interface ContractGenerationRequest {
  correlationId: string
  reservation: {
    id: string
    motoId: string
    customerId: string
    startDate: string
    endDate: string
    totalAmount: number
    depositAmount: number
    /**
     * Données dénormalisées jointes à la demande : le worker est isolé (aucun
     * accès BDD, aucun appel HTTP vers le backend, cf. ADR 007), il ne peut
     * donc composer un contrat lisible que si le message porte tout. Optionnel
     * car ces relations le sont sur l'entité Reservation.
     */
    customer?: ReservationCustomerSummary
    moto?: ReservationMotoSummary
    shop?: ReservationShopSummary
  }
}

export interface IContractQueuePublisher {
  publishContractGeneration(request: ContractGenerationRequest): Promise<void>
}
