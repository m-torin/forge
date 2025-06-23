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
import { ProductUncheckedUpdateManyWithoutParentNestedInputSchema } from './ProductUncheckedUpdateManyWithoutParentNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutProductNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutProductNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutProductsNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutProductsNestedInputSchema } from './TaxonomyUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutProductsNestedInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutProductNestedInputSchema } from './MediaUncheckedUpdateManyWithoutProductNestedInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutProductNestedInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutProductNestedInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutProductNestedInputSchema } from './RegistryItemUncheckedUpdateManyWithoutProductNestedInputSchema';
import { SeriesUncheckedUpdateManyWithoutProductsNestedInputSchema } from './SeriesUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { StoryUncheckedUpdateManyWithoutProductsNestedInputSchema } from './StoryUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { LocationUncheckedUpdateManyWithoutProductsNestedInputSchema } from './LocationUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { CastUncheckedUpdateManyWithoutProductsNestedInputSchema } from './CastUncheckedUpdateManyWithoutProductsNestedInputSchema';
import { CartItemUncheckedUpdateManyWithoutProductNestedInputSchema } from './CartItemUncheckedUpdateManyWithoutProductNestedInputSchema';
import { CartItemUncheckedUpdateManyWithoutVariantNestedInputSchema } from './CartItemUncheckedUpdateManyWithoutVariantNestedInputSchema';
import { OrderItemUncheckedUpdateManyWithoutProductNestedInputSchema } from './OrderItemUncheckedUpdateManyWithoutProductNestedInputSchema';
import { OrderItemUncheckedUpdateManyWithoutVariantNestedInputSchema } from './OrderItemUncheckedUpdateManyWithoutVariantNestedInputSchema';
import { InventoryUncheckedUpdateManyWithoutProductNestedInputSchema } from './InventoryUncheckedUpdateManyWithoutProductNestedInputSchema';
import { InventoryUncheckedUpdateManyWithoutVariantNestedInputSchema } from './InventoryUncheckedUpdateManyWithoutVariantNestedInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutProductNestedInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutProductNestedInputSchema';
import { ReviewUncheckedUpdateManyWithoutProductNestedInputSchema } from './ReviewUncheckedUpdateManyWithoutProductNestedInputSchema';

export const ProductUncheckedUpdateWithoutFandomsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutFandomsInput> =
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
      parentId: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
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
      children: z.lazy(() => ProductUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
      soldBy: z.lazy(() => PdpJoinUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
      collections: z
        .lazy(() => CollectionUncheckedUpdateManyWithoutProductsNestedInputSchema)
        .optional(),
      taxonomies: z
        .lazy(() => TaxonomyUncheckedUpdateManyWithoutProductsNestedInputSchema)
        .optional(),
      categories: z
        .lazy(() => ProductCategoryUncheckedUpdateManyWithoutProductsNestedInputSchema)
        .optional(),
      media: z.lazy(() => MediaUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
      favorites: z
        .lazy(() => FavoriteJoinUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      registries: z
        .lazy(() => RegistryItemUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      series: z.lazy(() => SeriesUncheckedUpdateManyWithoutProductsNestedInputSchema).optional(),
      stories: z.lazy(() => StoryUncheckedUpdateManyWithoutProductsNestedInputSchema).optional(),
      locations: z
        .lazy(() => LocationUncheckedUpdateManyWithoutProductsNestedInputSchema)
        .optional(),
      casts: z.lazy(() => CastUncheckedUpdateManyWithoutProductsNestedInputSchema).optional(),
      cartItems: z
        .lazy(() => CartItemUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      cartItemVariants: z
        .lazy(() => CartItemUncheckedUpdateManyWithoutVariantNestedInputSchema)
        .optional(),
      orderItems: z
        .lazy(() => OrderItemUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      orderItemVariants: z
        .lazy(() => OrderItemUncheckedUpdateManyWithoutVariantNestedInputSchema)
        .optional(),
      inventory: z
        .lazy(() => InventoryUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      inventoryVariants: z
        .lazy(() => InventoryUncheckedUpdateManyWithoutVariantNestedInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutProductNestedInputSchema)
        .optional(),
      reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
    })
    .strict();

export default ProductUncheckedUpdateWithoutFandomsInputSchema;
