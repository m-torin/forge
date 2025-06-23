import { z } from 'zod';
import type { Prisma } from '../../client';
import { CollectionIncludeSchema } from '../inputTypeSchemas/CollectionIncludeSchema';
import { CollectionWhereUniqueInputSchema } from '../inputTypeSchemas/CollectionWhereUniqueInputSchema';
import { CollectionArgsSchema } from '../outputTypeSchemas/CollectionArgsSchema';
import { CollectionFindManyArgsSchema } from '../outputTypeSchemas/CollectionFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { BrandFindManyArgsSchema } from '../outputTypeSchemas/BrandFindManyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { ProductCategoryFindManyArgsSchema } from '../outputTypeSchemas/ProductCategoryFindManyArgsSchema';
import { PdpJoinFindManyArgsSchema } from '../outputTypeSchemas/PdpJoinFindManyArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { FavoriteJoinFindManyArgsSchema } from '../outputTypeSchemas/FavoriteJoinFindManyArgsSchema';
import { RegistryItemFindManyArgsSchema } from '../outputTypeSchemas/RegistryItemFindManyArgsSchema';
import { ProductIdentifiersFindManyArgsSchema } from '../outputTypeSchemas/ProductIdentifiersFindManyArgsSchema';
import { CollectionCountOutputTypeArgsSchema } from '../outputTypeSchemas/CollectionCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CollectionSelectSchema: z.ZodType<Prisma.CollectionSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    type: z.boolean().optional(),
    status: z.boolean().optional(),
    userId: z.boolean().optional(),
    copy: z.boolean().optional(),
    parentId: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    parent: z.union([z.boolean(), z.lazy(() => CollectionArgsSchema)]).optional(),
    children: z.union([z.boolean(), z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    brands: z.union([z.boolean(), z.lazy(() => BrandFindManyArgsSchema)]).optional(),
    taxonomies: z.union([z.boolean(), z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
    categories: z.union([z.boolean(), z.lazy(() => ProductCategoryFindManyArgsSchema)]).optional(),
    pdpJoins: z.union([z.boolean(), z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    favorites: z.union([z.boolean(), z.lazy(() => FavoriteJoinFindManyArgsSchema)]).optional(),
    registries: z.union([z.boolean(), z.lazy(() => RegistryItemFindManyArgsSchema)]).optional(),
    identifiers: z
      .union([z.boolean(), z.lazy(() => ProductIdentifiersFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => CollectionCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const CollectionDeleteArgsSchema: z.ZodType<Prisma.CollectionDeleteArgs> = z
  .object({
    select: CollectionSelectSchema.optional(),
    include: z.lazy(() => CollectionIncludeSchema).optional(),
    where: CollectionWhereUniqueInputSchema,
  })
  .strict();

export default CollectionDeleteArgsSchema;
