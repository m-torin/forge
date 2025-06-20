import type { Prisma } from '../../client';

import { z } from 'zod';
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

export const PdpJoinWhereInputSchema: z.ZodType<Prisma.PdpJoinWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PdpJoinWhereInputSchema),z.lazy(() => PdpJoinWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PdpJoinWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PdpJoinWhereInputSchema),z.lazy(() => PdpJoinWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  brandId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  canonicalUrl: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
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
}).strict();

export default PdpJoinWhereInputSchema;
