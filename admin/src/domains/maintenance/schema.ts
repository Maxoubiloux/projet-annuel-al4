import { z } from 'zod';

const SEVERITIES = ['critical', 'warning', 'ok'] as const;
const STATUSES = ['open', 'scheduled', 'completed'] as const;

export const maintenanceJobSchema = z.object({
  motoId: z.string().min(1, 'Select a motorcycle'),
  type: z.string().trim().min(1, 'Job type is required'),
  date: z.string().min(1, 'Due date is required'),
  km: z.string().trim().min(1, 'Mileage is required').regex(/^\d+$/, 'Mileage must be a number'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  sev: z.enum(SEVERITIES),
  status: z.enum(STATUSES),
  notes: z.string().optional(),
});
