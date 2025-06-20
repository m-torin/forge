import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesArgsSchema } from "../outputTypeSchemas/SeriesArgsSchema"
import { FandomArgsSchema } from "../outputTypeSchemas/FandomArgsSchema"
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { StoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/StoryCountOutputTypeArgsSchema"

export const StoryIncludeSchema: z.ZodType<Prisma.StoryInclude> = z.object({
  series: z.union([z.boolean(),z.lazy(() => SeriesArgsSchema)]).optional(),
  fandom: z.union([z.boolean(),z.lazy(() => FandomArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => StoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default StoryIncludeSchema;
