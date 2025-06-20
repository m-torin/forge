import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// PRODUCT IDENTIFIERS SCHEMA
/////////////////////////////////////////

export const ProductIdentifiersSchema = z.object({
  id: z.string().cuid(),
  productId: z.string().nullable(),
  pdpJoinId: z.string().nullable(),
  collectionId: z.string().nullable(),
  brandId: z.string().nullable(),
  mpn: z.string().nullable(),
  upcA: z.string().nullable(),
  ean13: z.string().nullable(),
  gs1128: z.string().nullable(),
  upcE: z.string().nullable(),
  ean8: z.string().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  asin: z.string().nullable(),
  tcin: z.string().nullable(),
  dpci: z.string().nullable(),
  themoviedbId: z.string().nullable(),
  hardcoverappId: z.string().nullable(),
  itf14: z.string().nullable(),
  customBarcode: z.string().nullable(),
  customBarcodeType: z.string().nullable(),
  primaryIdentifierField: z.string().nullable(),
  source: z.string().nullable(),
  verifiedAt: z.coerce.date().nullable(),
  confidence: JsonValueSchema.nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductIdentifiers = z.infer<typeof ProductIdentifiersSchema>

export default ProductIdentifiersSchema;
