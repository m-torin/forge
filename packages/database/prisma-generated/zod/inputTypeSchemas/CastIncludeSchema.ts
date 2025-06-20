import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CastCountOutputTypeArgsSchema } from "../outputTypeSchemas/CastCountOutputTypeArgsSchema"

export const CastIncludeSchema: z.ZodType<Prisma.CastInclude> = z.object({
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CastCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default CastIncludeSchema;
