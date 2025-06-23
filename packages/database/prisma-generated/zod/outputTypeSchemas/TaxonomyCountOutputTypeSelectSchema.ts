import { z } from 'zod';
import type { Prisma } from '../../client';

export const TaxonomyCountOutputTypeSelectSchema: z.ZodType<Prisma.TaxonomyCountOutputTypeSelect> =
  z
    .object({
      children: z.boolean().optional(),
      products: z.boolean().optional(),
      collections: z.boolean().optional(),
      pdpJoins: z.boolean().optional(),
      locations: z.boolean().optional(),
      media: z.boolean().optional(),
      jrFindReplaceRejects: z.boolean().optional(),
    })
    .strict();

export default TaxonomyCountOutputTypeSelectSchema;
