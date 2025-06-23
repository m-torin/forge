import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { NestedEnumTaxonomyTypeFilterSchema } from './NestedEnumTaxonomyTypeFilterSchema';

export const EnumTaxonomyTypeFilterSchema: z.ZodType<Prisma.EnumTaxonomyTypeFilter> = z
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
      .union([z.lazy(() => TaxonomyTypeSchema), z.lazy(() => NestedEnumTaxonomyTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumTaxonomyTypeFilterSchema;
