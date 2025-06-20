import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyWhereInputSchema } from '../inputTypeSchemas/ApiKeyWhereInputSchema'
import { ApiKeyOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ApiKeyOrderByWithAggregationInputSchema'
import { ApiKeyScalarFieldEnumSchema } from '../inputTypeSchemas/ApiKeyScalarFieldEnumSchema'
import { ApiKeyScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ApiKeyScalarWhereWithAggregatesInputSchema'

export const ApiKeyGroupByArgsSchema: z.ZodType<Prisma.ApiKeyGroupByArgs> = z.object({
  where: ApiKeyWhereInputSchema.optional(),
  orderBy: z.union([ ApiKeyOrderByWithAggregationInputSchema.array(),ApiKeyOrderByWithAggregationInputSchema ]).optional(),
  by: ApiKeyScalarFieldEnumSchema.array(),
  having: ApiKeyScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ApiKeyGroupByArgsSchema;
