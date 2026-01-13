import { z } from 'zod';

export const createReceiptSchema = z.object({
  invoice_id: z.string().uuid(),
  client_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'pos']),
  payment_reference: z.string().max(255).optional(),
  station_code: z.enum(['FR-KAN', 'FR-DUT', 'FR-KAD', 'DL-KAN']),
});

export const updateReceiptSchema = createReceiptSchema.partial();

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
