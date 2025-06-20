import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { EnumCollectionTypeFieldUpdateOperationsInputSchema } from './EnumCollectionTypeFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { CollectionUpdateOneWithoutChildrenNestedInputSchema } from './CollectionUpdateOneWithoutChildrenNestedInputSchema';
import { UserUpdateOneWithoutCollectionsNestedInputSchema } from './UserUpdateOneWithoutCollectionsNestedInputSchema';
import { ProductUpdateManyWithoutCollectionsNestedInputSchema } from './ProductUpdateManyWithoutCollectionsNestedInputSchema';
import { BrandUpdateManyWithoutCollectionsNestedInputSchema } from './BrandUpdateManyWithoutCollectionsNestedInputSchema';
import { TaxonomyUpdateManyWithoutCollectionsNestedInputSchema } from './TaxonomyUpdateManyWithoutCollectionsNestedInputSchema';
import { ProductCategoryUpdateManyWithoutCollectionsNestedInputSchema } from './ProductCategoryUpdateManyWithoutCollectionsNestedInputSchema';
import { PdpJoinUpdateManyWithoutCollectionsNestedInputSchema } from './PdpJoinUpdateManyWithoutCollectionsNestedInputSchema';
import { MediaUpdateManyWithoutCollectionNestedInputSchema } from './MediaUpdateManyWithoutCollectionNestedInputSchema';
import { FavoriteJoinUpdateManyWithoutCollectionNestedInputSchema } from './FavoriteJoinUpdateManyWithoutCollectionNestedInputSchema';
import { RegistryItemUpdateManyWithoutCollectionNestedInputSchema } from './RegistryItemUpdateManyWithoutCollectionNestedInputSchema';
import { ProductIdentifiersUpdateManyWithoutCollectionNestedInputSchema } from './ProductIdentifiersUpdateManyWithoutCollectionNestedInputSchema';
import { UserUpdateOneWithoutDeletedCollectionsNestedInputSchema } from './UserUpdateOneWithoutDeletedCollectionsNestedInputSchema';

export const CollectionUpdateWithoutChildrenInputSchema: z.ZodType<Prisma.CollectionUpdateWithoutChildrenInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => CollectionTypeSchema),z.lazy(() => EnumCollectionTypeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ContentStatusSchema),z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  parent: z.lazy(() => CollectionUpdateOneWithoutChildrenNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutCollectionsNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutCollectionsNestedInputSchema).optional(),
  brands: z.lazy(() => BrandUpdateManyWithoutCollectionsNestedInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUpdateManyWithoutCollectionsNestedInputSchema).optional(),
  categories: z.lazy(() => ProductCategoryUpdateManyWithoutCollectionsNestedInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinUpdateManyWithoutCollectionsNestedInputSchema).optional(),
  media: z.lazy(() => MediaUpdateManyWithoutCollectionNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinUpdateManyWithoutCollectionNestedInputSchema).optional(),
  registries: z.lazy(() => RegistryItemUpdateManyWithoutCollectionNestedInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersUpdateManyWithoutCollectionNestedInputSchema).optional(),
  deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedCollectionsNestedInputSchema).optional()
}).strict();

export default CollectionUpdateWithoutChildrenInputSchema;
