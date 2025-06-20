import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinWhereInputSchema } from '../inputTypeSchemas/PdpJoinWhereInputSchema'
import { PdpJoinOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PdpJoinOrderByWithAggregationInputSchema'
import { PdpJoinScalarFieldEnumSchema } from '../inputTypeSchemas/PdpJoinScalarFieldEnumSchema'
import { PdpJoinScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PdpJoinScalarWhereWithAggregatesInputSchema'

export const PdpJoinGroupByArgsSchema: z.ZodType<Prisma.PdpJoinGroupByArgs> = z.object({
  where: PdpJoinWhereInputSchema.optional(),
  orderBy: z.union([ PdpJoinOrderByWithAggregationInputSchema.array(),PdpJoinOrderByWithAggregationInputSchema ]).optional(),
  by: PdpJoinScalarFieldEnumSchema.array(),
  having: PdpJoinScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PdpJoinGroupByArgsSchema;
