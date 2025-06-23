import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCreateNestedOneWithoutSoldByInputSchema } from './ProductCreateNestedOneWithoutSoldByInputSchema';
import { BrandCreateNestedOneWithoutProductsInputSchema } from './BrandCreateNestedOneWithoutProductsInputSchema';
import { LocationCreateNestedManyWithoutPdpJoinsInputSchema } from './LocationCreateNestedManyWithoutPdpJoinsInputSchema';
import { CollectionCreateNestedManyWithoutPdpJoinsInputSchema } from './CollectionCreateNestedManyWithoutPdpJoinsInputSchema';
import { MediaCreateNestedManyWithoutPdpJoinInputSchema } from './MediaCreateNestedManyWithoutPdpJoinInputSchema';
import { BrandCreateNestedManyWithoutManufacturedProductsInputSchema } from './BrandCreateNestedManyWithoutManufacturedProductsInputSchema';
import { ProductIdentifiersCreateNestedManyWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateNestedManyWithoutPdpJoinInputSchema';
import { PdpUrlCreateNestedManyWithoutPdpJoinInputSchema } from './PdpUrlCreateNestedManyWithoutPdpJoinInputSchema';

export const PdpJoinCreateWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinCreateWithoutTaxonomiesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      canonicalUrl: z.string(),
      iframeUrl: z.string().optional().nullable(),
      tempMediaUrls: z.string().optional().nullable(),
      lastScanned: z.coerce.date().optional().nullable(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      product: z.lazy(() => ProductCreateNestedOneWithoutSoldByInputSchema),
      brand: z.lazy(() => BrandCreateNestedOneWithoutProductsInputSchema),
      locations: z.lazy(() => LocationCreateNestedManyWithoutPdpJoinsInputSchema).optional(),
      collections: z.lazy(() => CollectionCreateNestedManyWithoutPdpJoinsInputSchema).optional(),
      media: z.lazy(() => MediaCreateNestedManyWithoutPdpJoinInputSchema).optional(),
      manufacturerBrands: z
        .lazy(() => BrandCreateNestedManyWithoutManufacturedProductsInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersCreateNestedManyWithoutPdpJoinInputSchema)
        .optional(),
      urls: z.lazy(() => PdpUrlCreateNestedManyWithoutPdpJoinInputSchema).optional(),
    })
    .strict();

export default PdpJoinCreateWithoutTaxonomiesInputSchema;
