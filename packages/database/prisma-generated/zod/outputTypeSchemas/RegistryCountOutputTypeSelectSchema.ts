import { z } from 'zod';
import type { Prisma } from '../../client';

export const RegistryCountOutputTypeSelectSchema: z.ZodType<Prisma.RegistryCountOutputTypeSelect> = z.object({
  items: z.boolean().optional(),
  users: z.boolean().optional(),
  cartItems: z.boolean().optional(),
  orderItems: z.boolean().optional(),
}).strict();

export default RegistryCountOutputTypeSelectSchema;
