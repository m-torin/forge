import { z } from 'zod';
import type { Prisma } from '../../client';
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

export const CollectionIncludeSchema: z.ZodType<Prisma.CollectionInclude> = z
  .object({
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

export default CollectionIncludeSchema;
