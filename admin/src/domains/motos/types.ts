export type MotoStatus = 'available' | 'reserved' | 'maintenance' | 'inactive';

export interface Moto {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number;
  category: string;
  mileage: number;
  pricePerDay: number;
  deposit: number;
  status: MotoStatus;
  location: string;
  description: string;
  imageUrl?: string;
}
