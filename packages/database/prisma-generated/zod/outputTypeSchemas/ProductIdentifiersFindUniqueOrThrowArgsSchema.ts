import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersIncludeSchema } from '../inputTypeSchemas/ProductIdentifiersIncludeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereUniqueInputSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { PdpJoinArgsSchema } from '../outputTypeSchemas/PdpJoinArgsSchema';
import { CollectionArgsSchema } from '../outputTypeSchemas/CollectionArgsSchema';
import { BrandArgsSchema } from '../outputTypeSchemas/BrandArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ProductIdentifiersSelectSchema: z.ZodType<Prisma.ProductIdentifiersSelect> = z
  .object({
    id: z.boolean().optional(),
    productId: z.boolean().optional(),
    pdpJoinId: z.boolean().optional(),
    collectionId: z.boolean().optional(),
    brandId: z.boolean().optional(),
    mpn: z.boolean().optional(),
    upcA: z.boolean().optional(),
    ean13: z.boolean().optional(),
    gs1128: z.boolean().optional(),
    upcE: z.boolean().optional(),
    ean8: z.boolean().optional(),
    isbn10: z.boolean().optional(),
    isbn13: z.boolean().optional(),
    asin: z.boolean().optional(),
    tcin: z.boolean().optional(),
    dpci: z.boolean().optional(),
    themoviedbId: z.boolean().optional(),
    hardcoverappId: z.boolean().optional(),
    itf14: z.boolean().optional(),
    customBarcode: z.boolean().optional(),
    customBarcodeType: z.boolean().optional(),
    primaryIdentifierField: z.boolean().optional(),
    source: z.boolean().optional(),
    verifiedAt: z.boolean().optional(),
    confidence: z.boolean().optional(),
    notes: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    pdpJoin: z.union([z.boolean(), z.lazy(() => PdpJoinArgsSchema)]).optional(),
    collection: z.union([z.boolean(), z.lazy(() => CollectionArgsSchema)]).optional(),
    brand: z.union([z.boolean(), z.lazy(() => BrandArgsSchema)]).optional(),
  })
  .strict();

export const ProductIdentifiersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductIdentifiersFindUniqueOrThrowArgs> =
  z
    .object({
      select: ProductIdentifiersSelectSchema.optional(),
      include: z.lazy(() => ProductIdentifiersIncludeSchema).optional(),
      where: ProductIdentifiersWhereUniqueInputSchema,
    })
    .strict();

export default ProductIdentifiersFindUniqueOrThrowArgsSchema;
