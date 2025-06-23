import { z } from 'zod';
import type { Prisma } from '../../client';

export const FandomCountOutputTypeSelectSchema: z.ZodType<Prisma.FandomCountOutputTypeSelect> = z
  .object({
    series: z.boolean().optional(),
    stories: z.boolean().optional(),
    products: z.boolean().optional(),
    locations: z.boolean().optional(),
    jrFindReplaceRejects: z.boolean().optional(),
  })
  .strict();

export default FandomCountOutputTypeSelectSchema;
