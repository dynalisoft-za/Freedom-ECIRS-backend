import { z } from 'zod';

export const createClientSchema = z.object({
  company_name: z.string().min(1).max(255),
  contact_person: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  tin: z.string().min(1).max(50),
  type: z.enum(['direct', 'agency']),
  address: z.string().max(500).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
