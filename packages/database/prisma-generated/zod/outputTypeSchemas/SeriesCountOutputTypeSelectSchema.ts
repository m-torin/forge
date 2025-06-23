import { z } from 'zod';
import type { Prisma } from '../../client';

export const SeriesCountOutputTypeSelectSchema: z.ZodType<Prisma.SeriesCountOutputTypeSelect> = z
  .object({
    stories: z.boolean().optional(),
    products: z.boolean().optional(),
    jrFindReplaceRejects: z.boolean().optional(),
  })
  .strict();

export default SeriesCountOutputTypeSelectSchema;
