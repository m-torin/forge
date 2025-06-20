import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlIncludeSchema } from '../inputTypeSchemas/PdpUrlIncludeSchema'
import { PdpUrlWhereUniqueInputSchema } from '../inputTypeSchemas/PdpUrlWhereUniqueInputSchema'
import { PdpJoinArgsSchema } from "../outputTypeSchemas/PdpJoinArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PdpUrlSelectSchema: z.ZodType<Prisma.PdpUrlSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  url: z.boolean().optional(),
  pdpJoinId: z.boolean().optional(),
  urlType: z.boolean().optional(),
  isActive: z.boolean().optional(),
  copy: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  pdpJoin: z.union([z.boolean(),z.lazy(() => PdpJoinArgsSchema)]).optional(),
}).strict()

export const PdpUrlFindUniqueArgsSchema: z.ZodType<Prisma.PdpUrlFindUniqueArgs> = z.object({
  select: PdpUrlSelectSchema.optional(),
  include: z.lazy(() => PdpUrlIncludeSchema).optional(),
  where: PdpUrlWhereUniqueInputSchema,
}).strict() ;

export default PdpUrlFindUniqueArgsSchema;
