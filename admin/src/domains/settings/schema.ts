import { z } from 'zod';

export const bookingRulesSchema = z.object({
  minDays: z.number().int().min(1, 'Must be at least 1 day'),
  maxDays: z.number().int().min(1, 'Must be at least 1 day'),
  minAge: z.number().int().min(18, 'Minimum driver age must be at least 18'),
  freeCancelHours: z.number().int().min(0, 'Cannot be negative'),
}).refine(r => r.maxDays >= r.minDays, {
  message: 'Maximum duration must be greater than or equal to the minimum',
  path: ['maxDays'],
});

export const companyInfoSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
});
