import { z } from 'zod';
import type { Prisma } from '../../client';

export const CastCountOutputTypeSelectSchema: z.ZodType<Prisma.CastCountOutputTypeSelect> = z.object({
  products: z.boolean().optional(),
  jrFindReplaceRejects: z.boolean().optional(),
}).strict();

export default CastCountOutputTypeSelectSchema;
