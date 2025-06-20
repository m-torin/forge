import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { CollectionCreateNestedOneWithoutChildrenInputSchema } from './CollectionCreateNestedOneWithoutChildrenInputSchema';
import { CollectionCreateNestedManyWithoutParentInputSchema } from './CollectionCreateNestedManyWithoutParentInputSchema';
import { UserCreateNestedOneWithoutCollectionsInputSchema } from './UserCreateNestedOneWithoutCollectionsInputSchema';
import { ProductCreateNestedManyWithoutCollectionsInputSchema } from './ProductCreateNestedManyWithoutCollectionsInputSchema';
import { BrandCreateNestedManyWithoutCollectionsInputSchema } from './BrandCreateNestedManyWithoutCollectionsInputSchema';
import { TaxonomyCreateNestedManyWithoutCollectionsInputSchema } from './TaxonomyCreateNestedManyWithoutCollectionsInputSchema';
import { ProductCategoryCreateNestedManyWithoutCollectionsInputSchema } from './ProductCategoryCreateNestedManyWithoutCollectionsInputSchema';
import { PdpJoinCreateNestedManyWithoutCollectionsInputSchema } from './PdpJoinCreateNestedManyWithoutCollectionsInputSchema';
import { MediaCreateNestedManyWithoutCollectionInputSchema } from './MediaCreateNestedManyWithoutCollectionInputSchema';
import { FavoriteJoinCreateNestedManyWithoutCollectionInputSchema } from './FavoriteJoinCreateNestedManyWithoutCollectionInputSchema';
import { RegistryItemCreateNestedManyWithoutCollectionInputSchema } from './RegistryItemCreateNestedManyWithoutCollectionInputSchema';
import { ProductIdentifiersCreateNestedManyWithoutCollectionInputSchema } from './ProductIdentifiersCreateNestedManyWithoutCollectionInputSchema';
import { UserCreateNestedOneWithoutDeletedCollectionsInputSchema } from './UserCreateNestedOneWithoutDeletedCollectionsInputSchema';

export const CollectionCreateInputSchema: z.ZodType<Prisma.CollectionCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => CollectionTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  parent: z.lazy(() => CollectionCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => CollectionCreateNestedManyWithoutParentInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCollectionsInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutCollectionsInputSchema).optional(),
  brands: z.lazy(() => BrandCreateNestedManyWithoutCollectionsInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyCreateNestedManyWithoutCollectionsInputSchema).optional(),
  categories: z.lazy(() => ProductCategoryCreateNestedManyWithoutCollectionsInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinCreateNestedManyWithoutCollectionsInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutCollectionInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinCreateNestedManyWithoutCollectionInputSchema).optional(),
  registries: z.lazy(() => RegistryItemCreateNestedManyWithoutCollectionInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersCreateNestedManyWithoutCollectionInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedCollectionsInputSchema).optional()
}).strict();

export default CollectionCreateInputSchema;
