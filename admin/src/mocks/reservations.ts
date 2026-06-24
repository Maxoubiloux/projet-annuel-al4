import type { Customer, Reservation } from '@/domains/reservations/types';
import { addDays, subDays, format } from 'date-fns';

const today = new Date();

export const CUSTOMERS_MOCK: Customer[] = [
  {
    id: 'c1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    licenseNumber: 'PC123456789',
    licenseVerified: true,
    status: 'active',
  },
  {
    id: 'c2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@email.com',
    phone: '+33 6 98 76 54 32',
    licenseNumber: 'PC987654321',
    licenseVerified: false,
    status: 'active',
  },
  {
    id: 'c3',
    firstName: 'Paul',
    lastName: 'Durand',
    email: 'paul.durand@email.com',
    phone: '+33 6 11 22 33 44',
    licenseNumber: 'PC112233445',
    licenseVerified: true,
    status: 'suspended',
  }
];

export const RESERVATIONS_MOCK: Reservation[] = [
  {
    id: 'r1',
    motoId: 'm1', // Yamaha MT-07
    customerId: 'c1',
    startDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    totalAmount: 340,
    depositAmount: 1000,
    status: 'in_progress',
    paymentStatus: 'paid',
    createdAt: format(subDays(today, 10), 'yyyy-MM-dd'),
  },
  {
    id: 'r2',
    motoId: 'm2', // Honda CB500F
    customerId: 'c2',
    startDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    totalAmount: 150,
    depositAmount: 800,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd'),
  },
  {
    id: 'r3',
    motoId: 'm3', // BMW GS
    customerId: 'c3',
    startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    totalAmount: 800,
    depositAmount: 2000,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: format(subDays(today, 15), 'yyyy-MM-dd'),
  },
  {
    id: 'r4',
    motoId: 'm4',
    customerId: 'c1',
    startDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 12), 'yyyy-MM-dd'),
    totalAmount: 220,
    depositAmount: 1500,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: format(today, 'yyyy-MM-dd'),
  }
];
