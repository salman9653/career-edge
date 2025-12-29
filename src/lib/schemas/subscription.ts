import { z } from 'zod';

export const EnterpriseSubscriptionSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  monthly_amount: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val >= 0, 'Amount must be positive'),
  yearly_amount: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val >= 0, 'Amount must be positive'),
  currency: z.literal('INR').default('INR'),
}).passthrough(); // Allow feature dynamic keys
