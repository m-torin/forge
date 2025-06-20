import { z } from 'zod';
import type { Prisma } from '../../client';

export const RegistryItemCountOutputTypeSelectSchema: z.ZodType<Prisma.RegistryItemCountOutputTypeSelect> = z.object({
  purchases: z.boolean().optional(),
}).strict();

export default RegistryItemCountOutputTypeSelectSchema;
