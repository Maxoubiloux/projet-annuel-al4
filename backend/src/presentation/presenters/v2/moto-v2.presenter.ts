import { Moto } from '@domain/entities/Moto'

/**
 * Contrat de réponse v2 pour une moto.
 *
 * BREAKING CHANGE vs v1 : le champ `pricePerDay` (float, en euros) est remplacé
 * par `dailyPriceCents` (entier, en centimes). Manipuler un entier en centimes
 * évite les erreurs d'arrondi en virgule flottante côté client.
 * Voir backend/docs/BREAKING_CHANGES.md et l'ADR 0004.
 */
export interface MotoV2Dto {
  id: string
  brand: string
  model: string
  plate: string
  year: number
  category: string
  mileage: number
  dailyPriceCents: number
  deposit: number
  status: string
  location: string
  description: string
  createdAt: Date
  imageUrl?: string
  nextServiceDate?: string
}

/**
 * Sérialise une entité Moto (domaine) vers le DTO v2.
 * Fonction pure — aucune dépendance externe, entièrement testable.
 */
export function motoToV2Dto(moto: Moto): MotoV2Dto {
  return {
    id: moto.id,
    brand: moto.brand,
    model: moto.model,
    plate: moto.plate,
    year: moto.year,
    category: moto.category,
    mileage: moto.mileage,
    dailyPriceCents: Math.round(moto.pricePerDay * 100),
    deposit: moto.deposit,
    status: moto.status,
    location: moto.location,
    description: moto.description,
    createdAt: moto.createdAt,
    imageUrl: moto.imageUrl,
    nextServiceDate: moto.nextServiceDate,
  }
}
