import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandNullableScalarRelationFilterSchema: z.ZodType<Prisma.BrandNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => BrandWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => BrandWhereInputSchema).optional().nullable()
}).strict();

export default BrandNullableScalarRelationFilterSchema;
