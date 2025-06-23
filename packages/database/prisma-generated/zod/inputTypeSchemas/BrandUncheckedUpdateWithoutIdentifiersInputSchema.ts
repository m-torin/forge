import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BrandTypeSchema } from './BrandTypeSchema';
import { EnumBrandTypeFieldUpdateOperationsInputSchema } from './EnumBrandTypeFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BrandUncheckedUpdateManyWithoutParentNestedInputSchema } from './BrandUncheckedUpdateManyWithoutParentNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutBrandNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutBrandNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutBrandsNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutBrandsNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutBrandNestedInputSchema } from './MediaUncheckedUpdateManyWithoutBrandNestedInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsNestedInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsNestedInputSchema';
import { JollyRogerUncheckedUpdateOneWithoutBrandNestedInputSchema } from './JollyRogerUncheckedUpdateOneWithoutBrandNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsNestedInputSchema';

export const BrandUncheckedUpdateWithoutIdentifiersInputSchema: z.ZodType<Prisma.BrandUncheckedUpdateWithoutIdentifiersInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      type: z
        .union([
          z.lazy(() => BrandTypeSchema),
          z.lazy(() => EnumBrandTypeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      status: z
        .union([
          z.lazy(() => ContentStatusSchema),
          z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      baseUrl: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
      parentId: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      displayOrder: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      deletedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      children: z.lazy(() => BrandUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
      products: z.lazy(() => PdpJoinUncheckedUpdateManyWithoutBrandNestedInputSchema).optional(),
      collections: z
        .lazy(() => CollectionUncheckedUpdateManyWithoutBrandsNestedInputSchema)
        .optional(),
      media: z.lazy(() => MediaUncheckedUpdateManyWithoutBrandNestedInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutBrandsNestedInputSchema)
        .optional(),
      jollyRoger: z
        .lazy(() => JollyRogerUncheckedUpdateOneWithoutBrandNestedInputSchema)
        .optional(),
      manufacturedProducts: z
        .lazy(() => PdpJoinUncheckedUpdateManyWithoutManufacturerBrandsNestedInputSchema)
        .optional(),
    })
    .strict();

export default BrandUncheckedUpdateWithoutIdentifiersInputSchema;
