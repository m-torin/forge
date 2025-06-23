import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { LocationUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema } from './LocationUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutPdpJoinNestedInputSchema } from './MediaUncheckedUpdateManyWithoutPdpJoinNestedInputSchema';
import { BrandUncheckedUpdateManyWithoutManufacturedProductsNestedInputSchema } from './BrandUncheckedUpdateManyWithoutManufacturedProductsNestedInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinNestedInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinNestedInputSchema';
import { PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInputSchema } from './PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInputSchema';

export const PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema: z.ZodType<Prisma.PdpJoinUncheckedUpdateWithoutTaxonomiesInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      productId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      brandId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
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
      locations: z
        .lazy(() => LocationUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema)
        .optional(),
      collections: z
        .lazy(() => CollectionUncheckedUpdateManyWithoutPdpJoinsNestedInputSchema)
        .optional(),
      media: z.lazy(() => MediaUncheckedUpdateManyWithoutPdpJoinNestedInputSchema).optional(),
      manufacturerBrands: z
        .lazy(() => BrandUncheckedUpdateManyWithoutManufacturedProductsNestedInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinNestedInputSchema)
        .optional(),
      urls: z.lazy(() => PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInputSchema).optional(),
    })
    .strict();

export default PdpJoinUncheckedUpdateWithoutTaxonomiesInputSchema;
