import {
  IContractQueuePublisher,
  ContractGenerationRequest,
} from '@domain/ports/IContractQueuePublisher'
import { RabbitMqConnection } from './rabbitmq.connection'
import { toContractJobRequest } from './messages'

/**
 * Implémentation RabbitMQ du port de publication de contrat.
 * Sérialise la demande métier au format d'échange et la publie sur la file de
 * demandes (persistant). Ne dépend d'aucun retour synchrone du worker.
 */
export class RabbitMqContractPublisher implements IContractQueuePublisher {
  constructor(private readonly connection: RabbitMqConnection) {}

  async publishContractGeneration(request: ContractGenerationRequest): Promise<void> {
    const channel = this.connection.requireChannel()
    const message = toContractJobRequest(request)
    const { requestQueue } = this.connection.getConfig()

    channel.sendToQueue(requestQueue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
      correlationId: request.correlationId,
    })
  }
}
