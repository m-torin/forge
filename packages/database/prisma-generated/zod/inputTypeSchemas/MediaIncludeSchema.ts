import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ArticleArgsSchema } from "../outputTypeSchemas/ArticleArgsSchema"
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"
import { CollectionArgsSchema } from "../outputTypeSchemas/CollectionArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { TaxonomyArgsSchema } from "../outputTypeSchemas/TaxonomyArgsSchema"
import { ProductCategoryArgsSchema } from "../outputTypeSchemas/ProductCategoryArgsSchema"
import { PdpJoinArgsSchema } from "../outputTypeSchemas/PdpJoinArgsSchema"
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"

export const MediaIncludeSchema: z.ZodType<Prisma.MediaInclude> = z.object({
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

export default MediaIncludeSchema;
