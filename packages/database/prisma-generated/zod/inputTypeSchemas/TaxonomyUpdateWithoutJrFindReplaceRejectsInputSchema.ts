import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { EnumTaxonomyTypeFieldUpdateOperationsInputSchema } from './EnumTaxonomyTypeFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { TaxonomyUpdateOneWithoutChildrenNestedInputSchema } from './TaxonomyUpdateOneWithoutChildrenNestedInputSchema';
import { TaxonomyUpdateManyWithoutParentNestedInputSchema } from './TaxonomyUpdateManyWithoutParentNestedInputSchema';
import { ProductUpdateManyWithoutTaxonomiesNestedInputSchema } from './ProductUpdateManyWithoutTaxonomiesNestedInputSchema';
import { CollectionUpdateManyWithoutTaxonomiesNestedInputSchema } from './CollectionUpdateManyWithoutTaxonomiesNestedInputSchema';
import { PdpJoinUpdateManyWithoutTaxonomiesNestedInputSchema } from './PdpJoinUpdateManyWithoutTaxonomiesNestedInputSchema';
import { LocationUpdateManyWithoutTaxonomiesNestedInputSchema } from './LocationUpdateManyWithoutTaxonomiesNestedInputSchema';
import { MediaUpdateManyWithoutTaxonomyNestedInputSchema } from './MediaUpdateManyWithoutTaxonomyNestedInputSchema';
import { UserUpdateOneWithoutDeletedTaxonomiesNestedInputSchema } from './UserUpdateOneWithoutDeletedTaxonomiesNestedInputSchema';

export const TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      type: z
        .union([
          z.lazy(() => TaxonomyTypeSchema),
          z.lazy(() => EnumTaxonomyTypeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      status: z
        .union([
          z.lazy(() => ContentStatusSchema),
          z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
      displayOrder: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
      level: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
      path: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
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
      parent: z.lazy(() => TaxonomyUpdateOneWithoutChildrenNestedInputSchema).optional(),
      children: z.lazy(() => TaxonomyUpdateManyWithoutParentNestedInputSchema).optional(),
      products: z.lazy(() => ProductUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
      collections: z.lazy(() => CollectionUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
      pdpJoins: z.lazy(() => PdpJoinUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
      locations: z.lazy(() => LocationUpdateManyWithoutTaxonomiesNestedInputSchema).optional(),
      media: z.lazy(() => MediaUpdateManyWithoutTaxonomyNestedInputSchema).optional(),
      deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedTaxonomiesNestedInputSchema).optional(),
    })
    .strict();

export default TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema;
