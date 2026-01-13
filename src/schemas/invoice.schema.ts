import { z } from 'zod';

export const createInvoiceSchema = z.object({
  contract_id: z.string().uuid(),
  client_id: z.string().uuid(),
  amount: z.number().positive(),
  vat_rate: z.number().min(0).max(100).default(7.5),
  due_date: z.string().datetime().or(z.date()),
  station_code: z.enum(['FR-KAN', 'FR-DUT', 'FR-KAD', 'DL-KAN']),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
