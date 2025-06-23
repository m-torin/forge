import { z } from 'zod';
import type { Prisma } from '../../client';

export const JrFindReplaceRejectCountOutputTypeSelectSchema: z.ZodType<Prisma.JrFindReplaceRejectCountOutputTypeSelect> =
  z
    .object({
      brands: z.boolean().optional(),
      locations: z.boolean().optional(),
      taxonomies: z.boolean().optional(),
      stories: z.boolean().optional(),
      fandoms: z.boolean().optional(),
      series: z.boolean().optional(),
      casts: z.boolean().optional(),
      extractionRules: z.boolean().optional(),
    })
    .strict();

export default JrFindReplaceRejectCountOutputTypeSelectSchema;
