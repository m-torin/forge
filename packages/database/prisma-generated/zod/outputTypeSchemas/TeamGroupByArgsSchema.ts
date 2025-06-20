import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema'
import { TeamOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TeamOrderByWithAggregationInputSchema'
import { TeamScalarFieldEnumSchema } from '../inputTypeSchemas/TeamScalarFieldEnumSchema'
import { TeamScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TeamScalarWhereWithAggregatesInputSchema'

export const TeamGroupByArgsSchema: z.ZodType<Prisma.TeamGroupByArgs> = z.object({
  where: TeamWhereInputSchema.optional(),
  orderBy: z.union([ TeamOrderByWithAggregationInputSchema.array(),TeamOrderByWithAggregationInputSchema ]).optional(),
  by: TeamScalarFieldEnumSchema.array(),
  having: TeamScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TeamGroupByArgsSchema;
