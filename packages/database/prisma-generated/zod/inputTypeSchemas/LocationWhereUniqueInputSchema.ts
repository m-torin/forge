import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereInputSchema } from './LocationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocationTypeFilterSchema } from './EnumLocationTypeFilterSchema';
import { LocationTypeSchema } from './LocationTypeSchema';
import { EnumLodgingTypeNullableFilterSchema } from './EnumLodgingTypeNullableFilterSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { FandomListRelationFilterSchema } from './FandomListRelationFilterSchema';
import { PdpJoinListRelationFilterSchema } from './PdpJoinListRelationFilterSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const LocationWhereUniqueInputSchema: z.ZodType<Prisma.LocationWhereUniqueInput> = z.union([
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
  AND: z.union([ z.lazy(() => LocationWhereInputSchema),z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => LocationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => LocationWhereInputSchema),z.lazy(() => LocationWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  locationType: z.union([ z.lazy(() => EnumLocationTypeFilterSchema),z.lazy(() => LocationTypeSchema) ]).optional(),
  lodgingType: z.union([ z.lazy(() => EnumLodgingTypeNullableFilterSchema),z.lazy(() => LodgingTypeSchema) ]).optional().nullable(),
  isFictional: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  fandoms: z.lazy(() => FandomListRelationFilterSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export default LocationWhereUniqueInputSchema;
