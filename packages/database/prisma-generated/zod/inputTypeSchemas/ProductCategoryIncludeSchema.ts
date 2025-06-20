import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryArgsSchema } from "../outputTypeSchemas/ProductCategoryArgsSchema"
import { ProductCategoryFindManyArgsSchema } from "../outputTypeSchemas/ProductCategoryFindManyArgsSchema"
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ProductCategoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/ProductCategoryCountOutputTypeArgsSchema"

export const ProductCategoryIncludeSchema: z.ZodType<Prisma.ProductCategoryInclude> = z.object({
  parent: z.union([z.boolean(),z.lazy(() => ProductCategoryArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => ProductCategoryFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ProductCategoryIncludeSchema;
