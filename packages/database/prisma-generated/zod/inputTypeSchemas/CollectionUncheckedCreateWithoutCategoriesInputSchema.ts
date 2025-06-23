import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { CollectionUncheckedCreateNestedManyWithoutParentInputSchema } from './CollectionUncheckedCreateNestedManyWithoutParentInputSchema';
import { ProductUncheckedCreateNestedManyWithoutCollectionsInputSchema } from './ProductUncheckedCreateNestedManyWithoutCollectionsInputSchema';
import { BrandUncheckedCreateNestedManyWithoutCollectionsInputSchema } from './BrandUncheckedCreateNestedManyWithoutCollectionsInputSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutCollectionsInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutCollectionsInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutCollectionsInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutCollectionsInputSchema';
import { MediaUncheckedCreateNestedManyWithoutCollectionInputSchema } from './MediaUncheckedCreateNestedManyWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInputSchema } from './FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInputSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutCollectionInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedCreateNestedManyWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedCreateNestedManyWithoutCollectionInputSchema';

export const CollectionUncheckedCreateWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionUncheckedCreateWithoutCategoriesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      type: z.lazy(() => CollectionTypeSchema).optional(),
      status: z.lazy(() => ContentStatusSchema).optional(),
      userId: z.string().optional().nullable(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      parentId: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      deletedById: z.string().optional().nullable(),
      children: z
        .lazy(() => CollectionUncheckedCreateNestedManyWithoutParentInputSchema)
        .optional(),
      products: z
        .lazy(() => ProductUncheckedCreateNestedManyWithoutCollectionsInputSchema)
        .optional(),
      brands: z.lazy(() => BrandUncheckedCreateNestedManyWithoutCollectionsInputSchema).optional(),
      taxonomies: z
        .lazy(() => TaxonomyUncheckedCreateNestedManyWithoutCollectionsInputSchema)
        .optional(),
      pdpJoins: z
        .lazy(() => PdpJoinUncheckedCreateNestedManyWithoutCollectionsInputSchema)
        .optional(),
      media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutCollectionInputSchema).optional(),
      favorites: z
        .lazy(() => FavoriteJoinUncheckedCreateNestedManyWithoutCollectionInputSchema)
        .optional(),
      registries: z
        .lazy(() => RegistryItemUncheckedCreateNestedManyWithoutCollectionInputSchema)
        .optional(),
      identifiers: z
        .lazy(() => ProductIdentifiersUncheckedCreateNestedManyWithoutCollectionInputSchema)
        .optional(),
    })
    .strict();

export default CollectionUncheckedCreateWithoutCategoriesInputSchema;
