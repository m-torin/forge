import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductIdentifiersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductIdentifiersMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  pdpJoinId: z.lazy(() => SortOrderSchema).optional(),
  collectionId: z.lazy(() => SortOrderSchema).optional(),
  brandId: z.lazy(() => SortOrderSchema).optional(),
  mpn: z.lazy(() => SortOrderSchema).optional(),
  upcA: z.lazy(() => SortOrderSchema).optional(),
  ean13: z.lazy(() => SortOrderSchema).optional(),
  gs1128: z.lazy(() => SortOrderSchema).optional(),
  upcE: z.lazy(() => SortOrderSchema).optional(),
  ean8: z.lazy(() => SortOrderSchema).optional(),
  isbn10: z.lazy(() => SortOrderSchema).optional(),
  isbn13: z.lazy(() => SortOrderSchema).optional(),
  asin: z.lazy(() => SortOrderSchema).optional(),
  tcin: z.lazy(() => SortOrderSchema).optional(),
  dpci: z.lazy(() => SortOrderSchema).optional(),
  themoviedbId: z.lazy(() => SortOrderSchema).optional(),
  hardcoverappId: z.lazy(() => SortOrderSchema).optional(),
  itf14: z.lazy(() => SortOrderSchema).optional(),
  customBarcode: z.lazy(() => SortOrderSchema).optional(),
  customBarcodeType: z.lazy(() => SortOrderSchema).optional(),
  primaryIdentifierField: z.lazy(() => SortOrderSchema).optional(),
  source: z.lazy(() => SortOrderSchema).optional(),
  verifiedAt: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ProductIdentifiersMaxOrderByAggregateInputSchema;
