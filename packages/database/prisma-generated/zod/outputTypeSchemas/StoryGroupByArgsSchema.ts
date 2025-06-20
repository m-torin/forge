import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryWhereInputSchema } from '../inputTypeSchemas/StoryWhereInputSchema'
import { StoryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/StoryOrderByWithAggregationInputSchema'
import { StoryScalarFieldEnumSchema } from '../inputTypeSchemas/StoryScalarFieldEnumSchema'
import { StoryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/StoryScalarWhereWithAggregatesInputSchema'

export const StoryGroupByArgsSchema: z.ZodType<Prisma.StoryGroupByArgs> = z.object({
  where: StoryWhereInputSchema.optional(),
  orderBy: z.union([ StoryOrderByWithAggregationInputSchema.array(),StoryOrderByWithAggregationInputSchema ]).optional(),
  by: StoryScalarFieldEnumSchema.array(),
  having: StoryScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default StoryGroupByArgsSchema;
