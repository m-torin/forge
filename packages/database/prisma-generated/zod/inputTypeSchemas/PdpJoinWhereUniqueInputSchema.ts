import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinProductIdBrandIdCompoundUniqueInputSchema } from './PdpJoinProductIdBrandIdCompoundUniqueInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ProductScalarRelationFilterSchema } from './ProductScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { BrandScalarRelationFilterSchema } from './BrandScalarRelationFilterSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { BrandListRelationFilterSchema } from './BrandListRelationFilterSchema';
import { ProductIdentifiersListRelationFilterSchema } from './ProductIdentifiersListRelationFilterSchema';
import { PdpUrlListRelationFilterSchema } from './PdpUrlListRelationFilterSchema';

export const PdpJoinWhereUniqueInputSchema: z.ZodType<Prisma.PdpJoinWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    canonicalUrl: z.string(),
    productId_brandId: z.lazy(() => PdpJoinProductIdBrandIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
    canonicalUrl: z.string(),
  }),
  z.object({
    id: z.string().cuid(),
    productId_brandId: z.lazy(() => PdpJoinProductIdBrandIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    canonicalUrl: z.string(),
    productId_brandId: z.lazy(() => PdpJoinProductIdBrandIdCompoundUniqueInputSchema),
  }),
  z.object({
    canonicalUrl: z.string(),
  }),
  z.object({
    productId_brandId: z.lazy(() => PdpJoinProductIdBrandIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  canonicalUrl: z.string().optional(),
  productId_brandId: z.lazy(() => PdpJoinProductIdBrandIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => PdpJoinWhereInputSchema),z.lazy(() => PdpJoinWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PdpJoinWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PdpJoinWhereInputSchema),z.lazy(() => PdpJoinWhereInputSchema).array() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  brandId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  iframeUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tempMediaUrls: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastScanned: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  copy: z.lazy(() => JsonFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  brand: z.union([ z.lazy(() => BrandScalarRelationFilterSchema),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  taxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
  media: z.lazy(() => MediaListRelationFilterSchema).optional(),
  manufacturerBrands: z.lazy(() => BrandListRelationFilterSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersListRelationFilterSchema).optional(),
  urls: z.lazy(() => PdpUrlListRelationFilterSchema).optional()
}).strict());

export default PdpJoinWhereUniqueInputSchema;
