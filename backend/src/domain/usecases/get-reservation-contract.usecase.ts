import { IReservationRepository } from '../repositories/IReservationRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ForbiddenError, NotFoundError } from '@shared/errors/DomainError'

export interface GetReservationContractParams {
  reservationId: string
  requester: {
    id: string
    isAdmin: boolean
  }
}

/** Identité du fichier à servir — la lecture disque appartient à la couche HTTP. */
export interface ReservationContractRef {
  reservationId: string
  fileName: string
}

/**
 * Autorise (ou non) le téléchargement du contrat PDF d'une réservation.
 *
 * Le contrat porte des données personnelles : seul l'administrateur ou le client
 * concerné peut le récupérer. Ce cas d'usage ne touche pas au système de
 * fichiers — il ne fait que décider et renvoyer le nom du fichier attendu.
 */
export class GetReservationContractUseCase {
  constructor(private readonly reservationRepository: IReservationRepository) { }

  async execute(
    params: GetReservationContractParams,
  ): Promise<Result<ReservationContractRef, NotFoundError | ForbiddenError>> {
    const reservation = await this.reservationRepository.findById(params.reservationId)
    if (!reservation) return err(new NotFoundError('Réservation', params.reservationId))

    if (!params.requester.isAdmin && reservation.customerId !== params.requester.id) {
      return err(new ForbiddenError('Ce contrat appartient à un autre client'))
    }

    // Le contrat est produit de façon asynchrone par le worker : tant qu'il
    // n'est pas `ready`, il n'y a rien à servir.
    if (reservation.contractStatus !== 'ready') {
      return err(new NotFoundError('Contrat', params.reservationId))
    }

    return ok({
      reservationId: reservation.id,
      // Le worker nomme le fichier d'après l'identifiant de la réservation.
      fileName: `${reservation.id}.pdf`,
    })
  }
}
