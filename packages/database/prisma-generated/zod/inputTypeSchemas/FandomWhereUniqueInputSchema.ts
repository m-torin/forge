import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { SeriesListRelationFilterSchema } from './SeriesListRelationFilterSchema';
import { StoryListRelationFilterSchema } from './StoryListRelationFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const FandomWhereUniqueInputSchema: z.ZodType<Prisma.FandomWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    slug: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => FandomWhereInputSchema),z.lazy(() => FandomWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FandomWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FandomWhereInputSchema),z.lazy(() => FandomWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isFictional: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  series: z.lazy(() => SeriesListRelationFilterSchema).optional(),
  stories: z.lazy(() => StoryListRelationFilterSchema).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export default FandomWhereUniqueInputSchema;
