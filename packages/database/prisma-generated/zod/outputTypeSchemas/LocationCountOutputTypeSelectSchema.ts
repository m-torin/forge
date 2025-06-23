import { z } from 'zod';
import type { Prisma } from '../../client';

export const LocationCountOutputTypeSelectSchema: z.ZodType<Prisma.LocationCountOutputTypeSelect> =
  z
    .object({
      products: z.boolean().optional(),
      fandoms: z.boolean().optional(),
      pdpJoins: z.boolean().optional(),
      taxonomies: z.boolean().optional(),
      jrFindReplaceRejects: z.boolean().optional(),
    })
    .strict();

export default LocationCountOutputTypeSelectSchema;
