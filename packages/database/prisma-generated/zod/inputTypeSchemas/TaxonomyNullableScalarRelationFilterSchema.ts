import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';

export const TaxonomyNullableScalarRelationFilterSchema: z.ZodType<Prisma.TaxonomyNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => TaxonomyWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => TaxonomyWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default TaxonomyNullableScalarRelationFilterSchema;
