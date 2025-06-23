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
import { BrandUpdateManyWithoutParentNestedInputSchema } from './BrandUpdateManyWithoutParentNestedInputSchema';
import { PdpJoinUpdateManyWithoutBrandNestedInputSchema } from './PdpJoinUpdateManyWithoutBrandNestedInputSchema';
import { CollectionUpdateManyWithoutBrandsNestedInputSchema } from './CollectionUpdateManyWithoutBrandsNestedInputSchema';
import { MediaUpdateManyWithoutBrandNestedInputSchema } from './MediaUpdateManyWithoutBrandNestedInputSchema';
import { JrFindReplaceRejectUpdateManyWithoutBrandsNestedInputSchema } from './JrFindReplaceRejectUpdateManyWithoutBrandsNestedInputSchema';
import { JollyRogerUpdateOneWithoutBrandNestedInputSchema } from './JollyRogerUpdateOneWithoutBrandNestedInputSchema';
import { ProductIdentifiersUpdateManyWithoutBrandNestedInputSchema } from './ProductIdentifiersUpdateManyWithoutBrandNestedInputSchema';
import { PdpJoinUpdateManyWithoutManufacturerBrandsNestedInputSchema } from './PdpJoinUpdateManyWithoutManufacturerBrandsNestedInputSchema';
import { UserUpdateOneWithoutDeletedBrandsNestedInputSchema } from './UserUpdateOneWithoutDeletedBrandsNestedInputSchema';

export const BrandUpdateWithoutParentInputSchema: z.ZodType<Prisma.BrandUpdateWithoutParentInput> =
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
      children: z.lazy(() => BrandUpdateManyWithoutParentNestedInputSchema).optional(),
      products: z.lazy(() => PdpJoinUpdateManyWithoutBrandNestedInputSchema).optional(),
      collections: z.lazy(() => CollectionUpdateManyWithoutBrandsNestedInputSchema).optional(),
      media: z.lazy(() => MediaUpdateManyWithoutBrandNestedInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectUpdateManyWithoutBrandsNestedInputSchema)
        .optional(),
      jollyRoger: z.lazy(() => JollyRogerUpdateOneWithoutBrandNestedInputSchema).optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUpdateManyWithoutBrandNestedInputSchema)
        .optional(),
      manufacturedProducts: z
        .lazy(() => PdpJoinUpdateManyWithoutManufacturerBrandsNestedInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedBrandsNestedInputSchema).optional(),
    })
    .strict();

export default BrandUpdateWithoutParentInputSchema;
