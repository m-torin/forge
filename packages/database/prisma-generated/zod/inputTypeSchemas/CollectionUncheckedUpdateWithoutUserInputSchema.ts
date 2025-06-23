import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { EnumCollectionTypeFieldUpdateOperationsInputSchema } from './EnumCollectionTypeFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { CollectionUncheckedUpdateManyWithoutParentNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutParentNestedInputSchema';
import { ProductUncheckedUpdateManyWithoutCollectionsNestedInputSchema } from './ProductUncheckedUpdateManyWithoutCollectionsNestedInputSchema';
import { BrandUncheckedUpdateManyWithoutCollectionsNestedInputSchema } from './BrandUncheckedUpdateManyWithoutCollectionsNestedInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutCollectionsNestedInputSchema } from './TaxonomyUncheckedUpdateManyWithoutCollectionsNestedInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutCollectionsNestedInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutCollectionsNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutCollectionsNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutCollectionsNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutCollectionNestedInputSchema } from './MediaUncheckedUpdateManyWithoutCollectionNestedInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutCollectionNestedInputSchema } from './RegistryItemUncheckedUpdateManyWithoutCollectionNestedInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutCollectionNestedInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutCollectionNestedInputSchema';

export const CollectionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CollectionUncheckedUpdateWithoutUserInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      type: z
        .union([
          z.lazy(() => CollectionTypeSchema),
          z.lazy(() => EnumCollectionTypeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      status: z
        .union([
          z.lazy(() => ContentStatusSchema),
          z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
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
      deletedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      children: z
        .lazy(() => CollectionUncheckedUpdateManyWithoutParentNestedInputSchema)
        .optional(),
      products: z
        .lazy(() => ProductUncheckedUpdateManyWithoutCollectionsNestedInputSchema)
        .optional(),
      brands: z.lazy(() => BrandUncheckedUpdateManyWithoutCollectionsNestedInputSchema).optional(),
      taxonomies: z
        .lazy(() => TaxonomyUncheckedUpdateManyWithoutCollectionsNestedInputSchema)
        .optional(),
      categories: z
        .lazy(() => ProductCategoryUncheckedUpdateManyWithoutCollectionsNestedInputSchema)
        .optional(),
      pdpJoins: z
        .lazy(() => PdpJoinUncheckedUpdateManyWithoutCollectionsNestedInputSchema)
        .optional(),
      media: z.lazy(() => MediaUncheckedUpdateManyWithoutCollectionNestedInputSchema).optional(),
      favorites: z
        .lazy(() => FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInputSchema)
        .optional(),
      registries: z
        .lazy(() => RegistryItemUncheckedUpdateManyWithoutCollectionNestedInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutCollectionNestedInputSchema)
        .optional(),
    })
    .strict();

export default CollectionUncheckedUpdateWithoutUserInputSchema;
