import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastIncludeSchema } from '../inputTypeSchemas/CastIncludeSchema'
import { CastWhereUniqueInputSchema } from '../inputTypeSchemas/CastWhereUniqueInputSchema'
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { CastCountOutputTypeArgsSchema } from "../outputTypeSchemas/CastCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CastSelectSchema: z.ZodType<Prisma.CastSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  isFictional: z.boolean().optional(),
  copy: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CastCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CastFindUniqueArgsSchema: z.ZodType<Prisma.CastFindUniqueArgs> = z.object({
  select: CastSelectSchema.optional(),
  include: z.lazy(() => CastIncludeSchema).optional(),
  where: CastWhereUniqueInputSchema,
}).strict() ;

export default CastFindUniqueArgsSchema;
