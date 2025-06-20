import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandWhereInputSchema } from '../inputTypeSchemas/BrandWhereInputSchema'
import { BrandOrderByWithAggregationInputSchema } from '../inputTypeSchemas/BrandOrderByWithAggregationInputSchema'
import { BrandScalarFieldEnumSchema } from '../inputTypeSchemas/BrandScalarFieldEnumSchema'
import { BrandScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/BrandScalarWhereWithAggregatesInputSchema'

export const BrandGroupByArgsSchema: z.ZodType<Prisma.BrandGroupByArgs> = z.object({
  where: BrandWhereInputSchema.optional(),
  orderBy: z.union([ BrandOrderByWithAggregationInputSchema.array(),BrandOrderByWithAggregationInputSchema ]).optional(),
  by: BrandScalarFieldEnumSchema.array(),
  having: BrandScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default BrandGroupByArgsSchema;
