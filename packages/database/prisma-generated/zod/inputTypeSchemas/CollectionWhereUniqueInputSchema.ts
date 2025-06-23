import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumCollectionTypeFilterSchema } from './EnumCollectionTypeFilterSchema';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { BrandListRelationFilterSchema } from './BrandListRelationFilterSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { ProductCategoryListRelationFilterSchema } from './ProductCategoryListRelationFilterSchema';
import { PdpJoinListRelationFilterSchema } from './PdpJoinListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { FavoriteJoinListRelationFilterSchema } from './FavoriteJoinListRelationFilterSchema';
import { RegistryItemListRelationFilterSchema } from './RegistryItemListRelationFilterSchema';
import { ProductIdentifiersListRelationFilterSchema } from './ProductIdentifiersListRelationFilterSchema';

export const CollectionWhereUniqueInputSchema: z.ZodType<Prisma.CollectionWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      slug: z.string(),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      slug: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        slug: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => CollectionWhereInputSchema),
            z.lazy(() => CollectionWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => CollectionWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => CollectionWhereInputSchema),
            z.lazy(() => CollectionWhereInputSchema).array(),
          ])
          .optional(),
        name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        type: z
          .union([z.lazy(() => EnumCollectionTypeFilterSchema), z.lazy(() => CollectionTypeSchema)])
          .optional(),
        status: z
          .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
          .optional(),
        userId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        copy: z.lazy(() => JsonFilterSchema).optional(),
        parentId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        deletedAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        deletedById: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        parent: z
          .union([
            z.lazy(() => CollectionNullableScalarRelationFilterSchema),
            z.lazy(() => CollectionWhereInputSchema),
          ])
          .optional()
          .nullable(),
        children: z.lazy(() => CollectionListRelationFilterSchema).optional(),
        user: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
        products: z.lazy(() => ProductListRelationFilterSchema).optional(),
        brands: z.lazy(() => BrandListRelationFilterSchema).optional(),
        taxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
        categories: z.lazy(() => ProductCategoryListRelationFilterSchema).optional(),
        pdpJoins: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
        media: z.lazy(() => MediaListRelationFilterSchema).optional(),
        favorites: z.lazy(() => FavoriteJoinListRelationFilterSchema).optional(),
        registries: z.lazy(() => RegistryItemListRelationFilterSchema).optional(),
        identifiers: z.lazy(() => ProductIdentifiersListRelationFilterSchema).optional(),
        deletedBy: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
      })
      .strict(),
  );

export default CollectionWhereUniqueInputSchema;
