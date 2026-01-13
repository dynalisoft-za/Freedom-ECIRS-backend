import { z } from 'zod';

export const createContractSchema = z.object({
  client_id: z.string().uuid(),
  campaign: z.string().min(1).max(255),
  amount: z.number().positive(),
  start_date: z.string().datetime().or(z.date()),
  end_date: z.string().datetime().or(z.date()),
  station_code: z.enum(['FR-KAN', 'FR-DUT', 'FR-KAD', 'DL-KAN']),
  status: z.enum(['draft', 'pending', 'approved', 'active', 'completed', 'cancelled']).optional(),
});

export const updateContractSchema = createContractSchema.partial();

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
