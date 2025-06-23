import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereInputSchema } from './LocationWhereInputSchema';

export const LocationListRelationFilterSchema: z.ZodType<Prisma.LocationListRelationFilter> = z
  .object({
    every: z.lazy(() => LocationWhereInputSchema).optional(),
    some: z.lazy(() => LocationWhereInputSchema).optional(),
    none: z.lazy(() => LocationWhereInputSchema).optional(),
  })
  .strict();

export default LocationListRelationFilterSchema;
