import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { ProductStatusSchema } from './ProductStatusSchema';
import { EnumProductStatusFieldUpdateOperationsInputSchema } from './EnumProductStatusFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableFloatFieldUpdateOperationsInputSchema } from './NullableFloatFieldUpdateOperationsInputSchema';
import { ProductTypeSchema } from './ProductTypeSchema';
import { EnumProductTypeFieldUpdateOperationsInputSchema } from './EnumProductTypeFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableDecimalFieldUpdateOperationsInputSchema } from './NullableDecimalFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { ProductUpdateaiSourcesInputSchema } from './ProductUpdateaiSourcesInputSchema';

export const ProductUncheckedUpdateManyWithoutParentInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutParentInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      sku: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      category: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      status: z
        .union([
          z.lazy(() => ProductStatusSchema),
          z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      brand: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      price: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      currency: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      type: z
        .union([
          z.lazy(() => ProductTypeSchema),
          z.lazy(() => EnumProductTypeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      variantPrice: z
        .union([
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
          z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema),
        ])
        .optional()
        .nullable(),
      compareAtPrice: z
        .union([
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
          z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema),
        ])
        .optional()
        .nullable(),
      physicalProperties: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      displayOrder: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
      isDefault: z
        .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
        .optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
      attributes: z
        .union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      createdBy: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      deletedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      aiGenerated: z
        .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
        .optional(),
      aiConfidence: z
        .union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      aiSources: z
        .union([z.lazy(() => ProductUpdateaiSourcesInputSchema), z.string().array()])
        .optional(),
    })
    .strict();

export default ProductUncheckedUpdateManyWithoutParentInputSchema;
