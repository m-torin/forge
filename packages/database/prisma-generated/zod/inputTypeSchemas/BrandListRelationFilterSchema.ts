import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandListRelationFilterSchema: z.ZodType<Prisma.BrandListRelationFilter> = z
  .object({
    every: z.lazy(() => BrandWhereInputSchema).optional(),
    some: z.lazy(() => BrandWhereInputSchema).optional(),
    none: z.lazy(() => BrandWhereInputSchema).optional(),
  })
  .strict();

export default BrandListRelationFilterSchema;
