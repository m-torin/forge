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
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { PdpJoinListRelationFilterSchema } from './PdpJoinListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const TaxonomyWhereInputSchema: z.ZodType<Prisma.TaxonomyWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TaxonomyWhereInputSchema),z.lazy(() => TaxonomyWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TaxonomyWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TaxonomyWhereInputSchema),z.lazy(() => TaxonomyWhereInputSchema).array() ]).optional(),
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
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  media: z.lazy(() => MediaListRelationFilterSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export default TaxonomyWhereInputSchema;
