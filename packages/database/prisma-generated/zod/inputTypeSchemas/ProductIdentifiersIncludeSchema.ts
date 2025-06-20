import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { PdpJoinArgsSchema } from "../outputTypeSchemas/PdpJoinArgsSchema"
import { CollectionArgsSchema } from "../outputTypeSchemas/CollectionArgsSchema"
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"

export const ProductIdentifiersIncludeSchema: z.ZodType<Prisma.ProductIdentifiersInclude> = z.object({
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  pdpJoin: z.union([z.boolean(),z.lazy(() => PdpJoinArgsSchema)]).optional(),
  collection: z.union([z.boolean(),z.lazy(() => CollectionArgsSchema)]).optional(),
  brand: z.union([z.boolean(),z.lazy(() => BrandArgsSchema)]).optional(),
}).strict()

export default ProductIdentifiersIncludeSchema;
