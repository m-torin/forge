import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBrandTypeFilterSchema } from './EnumBrandTypeFilterSchema';
import { BrandTypeSchema } from './BrandTypeSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BrandNullableScalarRelationFilterSchema } from './BrandNullableScalarRelationFilterSchema';
import { BrandListRelationFilterSchema } from './BrandListRelationFilterSchema';
import { PdpJoinListRelationFilterSchema } from './PdpJoinListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { JollyRogerNullableScalarRelationFilterSchema } from './JollyRogerNullableScalarRelationFilterSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { ProductIdentifiersListRelationFilterSchema } from './ProductIdentifiersListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const BrandWhereUniqueInputSchema: z.ZodType<Prisma.BrandWhereUniqueInput> = z.union([
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
  AND: z.union([ z.lazy(() => BrandWhereInputSchema),z.lazy(() => BrandWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BrandWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BrandWhereInputSchema),z.lazy(() => BrandWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumBrandTypeFilterSchema),z.lazy(() => BrandTypeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumContentStatusFilterSchema),z.lazy(() => ContentStatusSchema) ]).optional(),
  baseUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  displayOrder: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  deletedById: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  parent: z.union([ z.lazy(() => BrandNullableScalarRelationFilterSchema),z.lazy(() => BrandWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => BrandListRelationFilterSchema).optional(),
  products: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
  collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
  media: z.lazy(() => MediaListRelationFilterSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
  jollyRoger: z.union([ z.lazy(() => JollyRogerNullableScalarRelationFilterSchema),z.lazy(() => JollyRogerWhereInputSchema) ]).optional().nullable(),
  identifiers: z.lazy(() => ProductIdentifiersListRelationFilterSchema).optional(),
  manufacturedProducts: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
  deletedBy: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export default BrandWhereUniqueInputSchema;
