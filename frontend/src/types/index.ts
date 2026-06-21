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
  year: number;
  hp: number;
  torque: number;
  consumption: number;
  range: number;
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
