import { z } from 'zod';

const STATUSES = ['available', 'reserved', 'maintenance', 'inactive'] as const;
const CURRENT_YEAR = new Date().getFullYear();

export const motoSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required'),
  model: z.string().trim().min(1, 'Model is required'),
  plate: z.string().trim().min(1, 'Plate is required'),
  year: z.number()
    .int('Year must be a whole number')
    .min(1900, 'Year looks invalid')
    .max(CURRENT_YEAR + 1, 'Year looks invalid'),
  category: z.string().trim().min(1, 'Category is required'),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  pricePerDay: z.number().positive('Price must be greater than 0'),
  deposit: z.number().min(0, 'Deposit cannot be negative'),
  status: z.enum(STATUSES),
  location: z.string().trim().min(1, 'Location is required'),
  description: z.string().trim().min(1, 'Description is required'),
  imageUrl: z.string().optional(),
  nextServiceDate: z.string().optional(),
});
