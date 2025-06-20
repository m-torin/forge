import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomIncludeSchema } from '../inputTypeSchemas/FandomIncludeSchema'
import { FandomWhereUniqueInputSchema } from '../inputTypeSchemas/FandomWhereUniqueInputSchema'
import { FandomCreateInputSchema } from '../inputTypeSchemas/FandomCreateInputSchema'
import { FandomUncheckedCreateInputSchema } from '../inputTypeSchemas/FandomUncheckedCreateInputSchema'
import { FandomUpdateInputSchema } from '../inputTypeSchemas/FandomUpdateInputSchema'
import { FandomUncheckedUpdateInputSchema } from '../inputTypeSchemas/FandomUncheckedUpdateInputSchema'
import { SeriesFindManyArgsSchema } from "../outputTypeSchemas/SeriesFindManyArgsSchema"
import { StoryFindManyArgsSchema } from "../outputTypeSchemas/StoryFindManyArgsSchema"
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { LocationFindManyArgsSchema } from "../outputTypeSchemas/LocationFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { FandomCountOutputTypeArgsSchema } from "../outputTypeSchemas/FandomCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FandomSelectSchema: z.ZodType<Prisma.FandomSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  isFictional: z.boolean().optional(),
  copy: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  series: z.union([z.boolean(),z.lazy(() => SeriesFindManyArgsSchema)]).optional(),
  stories: z.union([z.boolean(),z.lazy(() => StoryFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => FandomCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const FandomUpsertArgsSchema: z.ZodType<Prisma.FandomUpsertArgs> = z.object({
  select: FandomSelectSchema.optional(),
  include: z.lazy(() => FandomIncludeSchema).optional(),
  where: FandomWhereUniqueInputSchema,
  create: z.union([ FandomCreateInputSchema,FandomUncheckedCreateInputSchema ]),
  update: z.union([ FandomUpdateInputSchema,FandomUncheckedUpdateInputSchema ]),
}).strict() ;

export default FandomUpsertArgsSchema;
