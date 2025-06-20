import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastWhereInputSchema } from '../inputTypeSchemas/CastWhereInputSchema'
import { CastOrderByWithRelationInputSchema } from '../inputTypeSchemas/CastOrderByWithRelationInputSchema'
import { CastWhereUniqueInputSchema } from '../inputTypeSchemas/CastWhereUniqueInputSchema'

export const CastAggregateArgsSchema: z.ZodType<Prisma.CastAggregateArgs> = z.object({
  where: CastWhereInputSchema.optional(),
  orderBy: z.union([ CastOrderByWithRelationInputSchema.array(),CastOrderByWithRelationInputSchema ]).optional(),
  cursor: CastWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CastAggregateArgsSchema;
