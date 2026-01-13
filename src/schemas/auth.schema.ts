import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).max(255),
  phone: z.string().min(10).max(20),
  role: z.enum(['super_admin', 'station_manager', 'sales_executive', 'accountant', 'viewer']),
  station_codes: z.array(z.enum(['FR-KAN', 'FR-DUT', 'FR-KAD', 'DL-KAN'])),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
