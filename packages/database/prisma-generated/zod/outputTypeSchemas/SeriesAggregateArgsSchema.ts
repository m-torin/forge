import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema'
import { SeriesOrderByWithRelationInputSchema } from '../inputTypeSchemas/SeriesOrderByWithRelationInputSchema'
import { SeriesWhereUniqueInputSchema } from '../inputTypeSchemas/SeriesWhereUniqueInputSchema'

export const SeriesAggregateArgsSchema: z.ZodType<Prisma.SeriesAggregateArgs> = z.object({
  where: SeriesWhereInputSchema.optional(),
  orderBy: z.union([ SeriesOrderByWithRelationInputSchema.array(),SeriesOrderByWithRelationInputSchema ]).optional(),
  cursor: SeriesWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default SeriesAggregateArgsSchema;
