import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInputSchema';
import { LocationUncheckedCreateNestedManyWithoutPdpJoinsInputSchema } from './LocationUncheckedCreateNestedManyWithoutPdpJoinsInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutPdpJoinsInputSchema } from './CollectionUncheckedCreateNestedManyWithoutPdpJoinsInputSchema';
import { MediaUncheckedCreateNestedManyWithoutPdpJoinInputSchema } from './MediaUncheckedCreateNestedManyWithoutPdpJoinInputSchema';
import { BrandUncheckedCreateNestedManyWithoutManufacturedProductsInputSchema } from './BrandUncheckedCreateNestedManyWithoutManufacturedProductsInputSchema';
import { ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInputSchema } from './PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInputSchema';

export const PdpJoinUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinUncheckedCreateWithoutProductInput> = z.object({
  id: z.string().cuid().optional(),
  brandId: z.string(),
  canonicalUrl: z.string(),
  iframeUrl: z.string().optional().nullable(),
  tempMediaUrls: z.string().optional().nullable(),
  lastScanned: z.coerce.date().optional().nullable(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taxonomies: z.lazy(() => TaxonomyUncheckedCreateNestedManyWithoutPdpJoinsInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutPdpJoinsInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedCreateNestedManyWithoutPdpJoinsInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutPdpJoinInputSchema).optional(),
  manufacturerBrands: z.lazy(() => BrandUncheckedCreateNestedManyWithoutManufacturedProductsInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInputSchema).optional(),
  urls: z.lazy(() => PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInputSchema).optional()
}).strict();

export default PdpJoinUncheckedCreateWithoutProductInputSchema;
