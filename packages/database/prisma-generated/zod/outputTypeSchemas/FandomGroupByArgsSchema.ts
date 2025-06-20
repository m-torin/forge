import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomWhereInputSchema } from '../inputTypeSchemas/FandomWhereInputSchema'
import { FandomOrderByWithAggregationInputSchema } from '../inputTypeSchemas/FandomOrderByWithAggregationInputSchema'
import { FandomScalarFieldEnumSchema } from '../inputTypeSchemas/FandomScalarFieldEnumSchema'
import { FandomScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/FandomScalarWhereWithAggregatesInputSchema'

export const FandomGroupByArgsSchema: z.ZodType<Prisma.FandomGroupByArgs> = z.object({
  where: FandomWhereInputSchema.optional(),
  orderBy: z.union([ FandomOrderByWithAggregationInputSchema.array(),FandomOrderByWithAggregationInputSchema ]).optional(),
  by: FandomScalarFieldEnumSchema.array(),
  having: FandomScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default FandomGroupByArgsSchema;
