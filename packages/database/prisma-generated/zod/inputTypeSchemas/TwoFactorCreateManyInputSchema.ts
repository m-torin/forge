import type { Prisma } from '../../client';

import { z } from 'zod';

export const TwoFactorCreateManyInputSchema: z.ZodType<Prisma.TwoFactorCreateManyInput> = z.object({
  id: z.string(),
  userId: z.string(),
  secret: z.string(),
  secretHash: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).strict();

export default TwoFactorCreateManyInputSchema;
