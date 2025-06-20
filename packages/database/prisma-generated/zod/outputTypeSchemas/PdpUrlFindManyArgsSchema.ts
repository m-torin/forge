import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlIncludeSchema } from '../inputTypeSchemas/PdpUrlIncludeSchema'
import { PdpUrlWhereInputSchema } from '../inputTypeSchemas/PdpUrlWhereInputSchema'
import { PdpUrlOrderByWithRelationInputSchema } from '../inputTypeSchemas/PdpUrlOrderByWithRelationInputSchema'
import { PdpUrlWhereUniqueInputSchema } from '../inputTypeSchemas/PdpUrlWhereUniqueInputSchema'
import { PdpUrlScalarFieldEnumSchema } from '../inputTypeSchemas/PdpUrlScalarFieldEnumSchema'
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

export const PdpUrlFindManyArgsSchema: z.ZodType<Prisma.PdpUrlFindManyArgs> = z.object({
  select: PdpUrlSelectSchema.optional(),
  include: z.lazy(() => PdpUrlIncludeSchema).optional(),
  where: PdpUrlWhereInputSchema.optional(),
  orderBy: z.union([ PdpUrlOrderByWithRelationInputSchema.array(),PdpUrlOrderByWithRelationInputSchema ]).optional(),
  cursor: PdpUrlWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PdpUrlScalarFieldEnumSchema,PdpUrlScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default PdpUrlFindManyArgsSchema;
