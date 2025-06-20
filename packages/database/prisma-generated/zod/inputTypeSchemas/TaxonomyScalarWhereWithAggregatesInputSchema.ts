import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumTaxonomyTypeWithAggregatesFilterSchema } from './EnumTaxonomyTypeWithAggregatesFilterSchema';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { EnumContentStatusWithAggregatesFilterSchema } from './EnumContentStatusWithAggregatesFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const TaxonomyScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TaxonomyScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TaxonomyScalarWhereWithAggregatesInputSchema),z.lazy(() => TaxonomyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaxonomyScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaxonomyScalarWhereWithAggregatesInputSchema),z.lazy(() => TaxonomyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumTaxonomyTypeWithAggregatesFilterSchema),z.lazy(() => TaxonomyTypeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumContentStatusWithAggregatesFilterSchema),z.lazy(() => ContentStatusSchema) ]).optional(),
  copy: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default TaxonomyScalarWhereWithAggregatesInputSchema;
