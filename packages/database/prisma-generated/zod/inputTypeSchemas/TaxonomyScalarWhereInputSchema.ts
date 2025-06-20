import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumTaxonomyTypeFilterSchema } from './EnumTaxonomyTypeFilterSchema';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const TaxonomyScalarWhereInputSchema: z.ZodType<Prisma.TaxonomyScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaxonomyScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumTaxonomyTypeFilterSchema),z.lazy(() => TaxonomyTypeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumContentStatusFilterSchema),z.lazy(() => ContentStatusSchema) ]).optional(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default TaxonomyScalarWhereInputSchema;
