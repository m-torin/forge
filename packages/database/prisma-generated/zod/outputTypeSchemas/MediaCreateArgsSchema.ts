import { z } from 'zod';
import type { Prisma } from '../../client';
import { MediaIncludeSchema } from '../inputTypeSchemas/MediaIncludeSchema'
import { MediaCreateInputSchema } from '../inputTypeSchemas/MediaCreateInputSchema'
import { MediaUncheckedCreateInputSchema } from '../inputTypeSchemas/MediaUncheckedCreateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ArticleArgsSchema } from "../outputTypeSchemas/ArticleArgsSchema"
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"
import { CollectionArgsSchema } from "../outputTypeSchemas/CollectionArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { TaxonomyArgsSchema } from "../outputTypeSchemas/TaxonomyArgsSchema"
import { ProductCategoryArgsSchema } from "../outputTypeSchemas/ProductCategoryArgsSchema"
import { PdpJoinArgsSchema } from "../outputTypeSchemas/PdpJoinArgsSchema"
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MediaSelectSchema: z.ZodType<Prisma.MediaSelect> = z.object({
  id: z.boolean().optional(),
  url: z.boolean().optional(),
  altText: z.boolean().optional(),
  type: z.boolean().optional(),
  width: z.boolean().optional(),
  height: z.boolean().optional(),
  size: z.boolean().optional(),
  mimeType: z.boolean().optional(),
  sortOrder: z.boolean().optional(),
  userId: z.boolean().optional(),
  copy: z.boolean().optional(),
  articleId: z.boolean().optional(),
  brandId: z.boolean().optional(),
  collectionId: z.boolean().optional(),
  productId: z.boolean().optional(),
  taxonomyId: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  pdpJoinId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  reviewId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  article: z.union([z.boolean(),z.lazy(() => ArticleArgsSchema)]).optional(),
  brand: z.union([z.boolean(),z.lazy(() => BrandArgsSchema)]).optional(),
  collection: z.union([z.boolean(),z.lazy(() => CollectionArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  taxonomy: z.union([z.boolean(),z.lazy(() => TaxonomyArgsSchema)]).optional(),
  category: z.union([z.boolean(),z.lazy(() => ProductCategoryArgsSchema)]).optional(),
  pdpJoin: z.union([z.boolean(),z.lazy(() => PdpJoinArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict()

export const MediaCreateArgsSchema: z.ZodType<Prisma.MediaCreateArgs> = z.object({
  select: MediaSelectSchema.optional(),
  include: z.lazy(() => MediaIncludeSchema).optional(),
  data: z.union([ MediaCreateInputSchema,MediaUncheckedCreateInputSchema ]),
}).strict() ;

export default MediaCreateArgsSchema;
