import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { CollectionArgsSchema } from "../outputTypeSchemas/CollectionArgsSchema"

export const FavoriteJoinIncludeSchema: z.ZodType<Prisma.FavoriteJoinInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  collection: z.union([z.boolean(),z.lazy(() => CollectionArgsSchema)]).optional(),
}).strict()

export default FavoriteJoinIncludeSchema;
