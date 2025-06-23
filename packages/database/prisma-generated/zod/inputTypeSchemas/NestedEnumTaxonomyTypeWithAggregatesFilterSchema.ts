import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumTaxonomyTypeFilterSchema } from './NestedEnumTaxonomyTypeFilterSchema';

export const NestedEnumTaxonomyTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumTaxonomyTypeWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => TaxonomyTypeSchema).optional(),
      in: z
        .lazy(() => TaxonomyTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => TaxonomyTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => TaxonomyTypeSchema),
          z.lazy(() => NestedEnumTaxonomyTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumTaxonomyTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumTaxonomyTypeFilterSchema).optional(),
    })
    .strict();

export default NestedEnumTaxonomyTypeWithAggregatesFilterSchema;
