import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ProductUpdateOneRequiredWithoutSoldByNestedInputSchema } from './ProductUpdateOneRequiredWithoutSoldByNestedInputSchema';
import { BrandUpdateOneRequiredWithoutProductsNestedInputSchema } from './BrandUpdateOneRequiredWithoutProductsNestedInputSchema';
import { TaxonomyUpdateManyWithoutPdpJoinsNestedInputSchema } from './TaxonomyUpdateManyWithoutPdpJoinsNestedInputSchema';
import { LocationUpdateManyWithoutPdpJoinsNestedInputSchema } from './LocationUpdateManyWithoutPdpJoinsNestedInputSchema';
import { MediaUpdateManyWithoutPdpJoinNestedInputSchema } from './MediaUpdateManyWithoutPdpJoinNestedInputSchema';
import { BrandUpdateManyWithoutManufacturedProductsNestedInputSchema } from './BrandUpdateManyWithoutManufacturedProductsNestedInputSchema';
import { ProductIdentifiersUpdateManyWithoutPdpJoinNestedInputSchema } from './ProductIdentifiersUpdateManyWithoutPdpJoinNestedInputSchema';
import { PdpUrlUpdateManyWithoutPdpJoinNestedInputSchema } from './PdpUrlUpdateManyWithoutPdpJoinNestedInputSchema';

export const PdpJoinUpdateWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithoutCollectionsInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      canonicalUrl: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      iframeUrl: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      tempMediaUrls: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      lastScanned: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      product: z.lazy(() => ProductUpdateOneRequiredWithoutSoldByNestedInputSchema).optional(),
      brand: z.lazy(() => BrandUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
      taxonomies: z.lazy(() => TaxonomyUpdateManyWithoutPdpJoinsNestedInputSchema).optional(),
      locations: z.lazy(() => LocationUpdateManyWithoutPdpJoinsNestedInputSchema).optional(),
      media: z.lazy(() => MediaUpdateManyWithoutPdpJoinNestedInputSchema).optional(),
      manufacturerBrands: z
        .lazy(() => BrandUpdateManyWithoutManufacturedProductsNestedInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUpdateManyWithoutPdpJoinNestedInputSchema)
        .optional(),
      urls: z.lazy(() => PdpUrlUpdateManyWithoutPdpJoinNestedInputSchema).optional(),
    })
    .strict();

export default PdpJoinUpdateWithoutCollectionsInputSchema;
