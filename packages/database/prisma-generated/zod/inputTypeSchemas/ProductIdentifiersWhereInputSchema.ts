import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { PdpJoinNullableScalarRelationFilterSchema } from './PdpJoinNullableScalarRelationFilterSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { BrandNullableScalarRelationFilterSchema } from './BrandNullableScalarRelationFilterSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const ProductIdentifiersWhereInputSchema: z.ZodType<Prisma.ProductIdentifiersWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProductIdentifiersWhereInputSchema),z.lazy(() => ProductIdentifiersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductIdentifiersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductIdentifiersWhereInputSchema),z.lazy(() => ProductIdentifiersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  pdpJoinId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  collectionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  brandId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  mpn: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  upcA: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ean13: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  gs1128: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  upcE: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ean8: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isbn10: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isbn13: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  asin: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tcin: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  dpci: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  themoviedbId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  hardcoverappId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  itf14: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  customBarcode: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  customBarcodeType: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  primaryIdentifierField: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  source: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  verifiedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  confidence: z.lazy(() => JsonNullableFilterSchema).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  pdpJoin: z.union([ z.lazy(() => PdpJoinNullableScalarRelationFilterSchema),z.lazy(() => PdpJoinWhereInputSchema) ]).optional().nullable(),
  collection: z.union([ z.lazy(() => CollectionNullableScalarRelationFilterSchema),z.lazy(() => CollectionWhereInputSchema) ]).optional().nullable(),
  brand: z.union([ z.lazy(() => BrandNullableScalarRelationFilterSchema),z.lazy(() => BrandWhereInputSchema) ]).optional().nullable(),
}).strict();

export default ProductIdentifiersWhereInputSchema;
