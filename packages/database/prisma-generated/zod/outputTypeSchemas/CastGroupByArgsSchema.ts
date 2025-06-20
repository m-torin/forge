import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastWhereInputSchema } from '../inputTypeSchemas/CastWhereInputSchema'
import { CastOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CastOrderByWithAggregationInputSchema'
import { CastScalarFieldEnumSchema } from '../inputTypeSchemas/CastScalarFieldEnumSchema'
import { CastScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CastScalarWhereWithAggregatesInputSchema'

export const CastGroupByArgsSchema: z.ZodType<Prisma.CastGroupByArgs> = z.object({
  where: CastWhereInputSchema.optional(),
  orderBy: z.union([ CastOrderByWithAggregationInputSchema.array(),CastOrderByWithAggregationInputSchema ]).optional(),
  by: CastScalarFieldEnumSchema.array(),
  having: CastScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CastGroupByArgsSchema;
