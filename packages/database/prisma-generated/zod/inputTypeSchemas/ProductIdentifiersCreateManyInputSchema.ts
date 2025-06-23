import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const ProductIdentifiersCreateManyInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      productId: z.string().optional().nullable(),
      pdpJoinId: z.string().optional().nullable(),
      collectionId: z.string().optional().nullable(),
      brandId: z.string().optional().nullable(),
      mpn: z.string().optional().nullable(),
      upcA: z.string().optional().nullable(),
      ean13: z.string().optional().nullable(),
      gs1128: z.string().optional().nullable(),
      upcE: z.string().optional().nullable(),
      ean8: z.string().optional().nullable(),
      isbn10: z.string().optional().nullable(),
      isbn13: z.string().optional().nullable(),
      asin: z.string().optional().nullable(),
      tcin: z.string().optional().nullable(),
      dpci: z.string().optional().nullable(),
      themoviedbId: z.string().optional().nullable(),
      hardcoverappId: z.string().optional().nullable(),
      itf14: z.string().optional().nullable(),
      customBarcode: z.string().optional().nullable(),
      customBarcodeType: z.string().optional().nullable(),
      primaryIdentifierField: z.string().optional().nullable(),
      source: z.string().optional().nullable(),
      verifiedAt: z.coerce.date().optional().nullable(),
      confidence: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      notes: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .strict();

export default ProductIdentifiersCreateManyInputSchema;
