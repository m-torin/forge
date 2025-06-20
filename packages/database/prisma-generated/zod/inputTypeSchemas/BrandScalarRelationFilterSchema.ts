import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandScalarRelationFilterSchema: z.ZodType<Prisma.BrandScalarRelationFilter> = z.object({
  is: z.lazy(() => BrandWhereInputSchema).optional(),
  isNot: z.lazy(() => BrandWhereInputSchema).optional()
}).strict();

export default BrandScalarRelationFilterSchema;
