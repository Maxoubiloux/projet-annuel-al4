import { Moto } from '@domain/entities/Moto'
import { motoToV2Dto } from '@presentation/presenters/v2/moto-v2.presenter'

function makeMoto(overrides: Partial<Moto> = {}): Moto {
  const base = new Moto(
    'moto-1',
    'Yamaha',
    'MT-07',
    'AA-123-BB',
    2023,
    'roadster',
    12000,
    49.9, // pricePerDay en euros
    800,
    'available',
    'Paris',
    'Roadster polyvalent',
    new Date('2026-01-01T00:00:00.000Z'),
    'http://localhost:3000/uploads/motos/x.jpg',
    '2026-09-01',
  )
  return { ...base, ...overrides } as Moto
}

describe('motoToV2Dto', () => {
  it('remplace pricePerDay (euros) par dailyPriceCents (centimes entiers)', () => {
    const dto = motoToV2Dto(makeMoto())
    expect(dto.dailyPriceCents).toBe(4990)
    expect(Number.isInteger(dto.dailyPriceCents)).toBe(true)
  })

  it('supprime totalement le champ pricePerDay du contrat v2', () => {
    const dto = motoToV2Dto(makeMoto())
    expect('pricePerDay' in dto).toBe(false)
  })

  it('arrondit correctement les prix à virgule flottante délicats', () => {
    // 29.99 € * 100 = 2998.9999... en flottant -> doit donner 2999 centimes
    expect(motoToV2Dto(makeMoto({ pricePerDay: 29.99 } as Partial<Moto>)).dailyPriceCents).toBe(2999)
    expect(motoToV2Dto(makeMoto({ pricePerDay: 0 } as Partial<Moto>)).dailyPriceCents).toBe(0)
    expect(motoToV2Dto(makeMoto({ pricePerDay: 100 } as Partial<Moto>)).dailyPriceCents).toBe(10000)
  })

  it('préserve les autres champs métier à l’identique', () => {
    const moto = makeMoto()
    const dto = motoToV2Dto(moto)
    expect(dto.id).toBe(moto.id)
    expect(dto.brand).toBe(moto.brand)
    expect(dto.model).toBe(moto.model)
    expect(dto.deposit).toBe(moto.deposit)
    expect(dto.status).toBe(moto.status)
    expect(dto.createdAt).toBe(moto.createdAt)
    expect(dto.imageUrl).toBe(moto.imageUrl)
    expect(dto.nextServiceDate).toBe(moto.nextServiceDate)
  })

  it('gère les champs optionnels absents', () => {
    const dto = motoToV2Dto(makeMoto({ imageUrl: undefined, nextServiceDate: undefined } as Partial<Moto>))
    expect(dto.imageUrl).toBeUndefined()
    expect(dto.nextServiceDate).toBeUndefined()
  })
})
