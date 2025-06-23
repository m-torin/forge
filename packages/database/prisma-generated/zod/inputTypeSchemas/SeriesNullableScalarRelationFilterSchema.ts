import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';

export const SeriesNullableScalarRelationFilterSchema: z.ZodType<Prisma.SeriesNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => SeriesWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => SeriesWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default SeriesNullableScalarRelationFilterSchema;
