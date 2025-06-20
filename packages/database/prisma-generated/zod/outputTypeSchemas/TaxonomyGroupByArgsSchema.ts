import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyWhereInputSchema } from '../inputTypeSchemas/TaxonomyWhereInputSchema'
import { TaxonomyOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TaxonomyOrderByWithAggregationInputSchema'
import { TaxonomyScalarFieldEnumSchema } from '../inputTypeSchemas/TaxonomyScalarFieldEnumSchema'
import { TaxonomyScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TaxonomyScalarWhereWithAggregatesInputSchema'

export const TaxonomyGroupByArgsSchema: z.ZodType<Prisma.TaxonomyGroupByArgs> = z.object({
  where: TaxonomyWhereInputSchema.optional(),
  orderBy: z.union([ TaxonomyOrderByWithAggregationInputSchema.array(),TaxonomyOrderByWithAggregationInputSchema ]).optional(),
  by: TaxonomyScalarFieldEnumSchema.array(),
  having: TaxonomyScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TaxonomyGroupByArgsSchema;
