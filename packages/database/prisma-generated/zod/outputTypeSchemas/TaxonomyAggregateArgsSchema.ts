import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyWhereInputSchema } from '../inputTypeSchemas/TaxonomyWhereInputSchema'
import { TaxonomyOrderByWithRelationInputSchema } from '../inputTypeSchemas/TaxonomyOrderByWithRelationInputSchema'
import { TaxonomyWhereUniqueInputSchema } from '../inputTypeSchemas/TaxonomyWhereUniqueInputSchema'

export const TaxonomyAggregateArgsSchema: z.ZodType<Prisma.TaxonomyAggregateArgs> = z.object({
  where: TaxonomyWhereInputSchema.optional(),
  orderBy: z.union([ TaxonomyOrderByWithRelationInputSchema.array(),TaxonomyOrderByWithRelationInputSchema ]).optional(),
  cursor: TaxonomyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TaxonomyAggregateArgsSchema;
