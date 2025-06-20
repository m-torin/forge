import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const CastWhereInputSchema: z.ZodType<Prisma.CastWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CastWhereInputSchema),z.lazy(() => CastWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CastWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CastWhereInputSchema),z.lazy(() => CastWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isFictional: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export default CastWhereInputSchema;
