/**
 * Port domaine : publication d'une demande de génération de contrat de location
 * vers le worker (via une file de messages). Le domaine ne connaît ni RabbitMQ
 * ni le format de sérialisation — cf. règle d'isolation (backend/CLAUDE.md).
 *
 * L'entrée est décrite en termes métier (camelCase) ; la traduction vers le
 * format d'échange sur la file est la responsabilité de l'implémentation
 * d'infrastructure.
 */
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
  }
}

export interface IContractQueuePublisher {
  publishContractGeneration(request: ContractGenerationRequest): Promise<void>
}
