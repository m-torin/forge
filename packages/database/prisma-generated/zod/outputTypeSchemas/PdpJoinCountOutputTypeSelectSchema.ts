import { z } from 'zod';
import type { Prisma } from '../../client';

export const PdpJoinCountOutputTypeSelectSchema: z.ZodType<Prisma.PdpJoinCountOutputTypeSelect> = z
  .object({
    taxonomies: z.boolean().optional(),
    locations: z.boolean().optional(),
    collections: z.boolean().optional(),
    media: z.boolean().optional(),
    manufacturerBrands: z.boolean().optional(),
    identifiers: z.boolean().optional(),
    urls: z.boolean().optional(),
  })
  .strict();

export default PdpJoinCountOutputTypeSelectSchema;
