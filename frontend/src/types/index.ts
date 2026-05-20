export interface Motorbike {
  id: string;
  brand: string;
  model: string;
  registration: string;
  category: 'A' | 'A2' | 'A1';
  style: 'Sportive' | 'Roadster' | 'Trail' | 'Touring' | 'Custom';
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  currentKm: number;
  pricePerDay: number;
  imageUrl: string;
  description: string;
  createdAt: string;
  // Spécifications techniques
  year: number;
  hp: number; // Chevaux (ch)
  torque: number; // Couple (Nm)
  consumption: number; // Consommation (L/100km)
  range: number; // Autonomie (km)
}

export interface Booking {
  id: string;
  motorbikeId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  code?: string;
  imageUrl: string;
  validUntil: string;
  category: string;
}
