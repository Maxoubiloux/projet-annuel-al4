import { z } from 'zod';

export const customerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
  licenseNumber: z.string().trim().min(1, 'Licence number is required'),
  licenseVerified: z.boolean(),
  status: z.enum(['active', 'suspended']),
});
