import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlWhereInputSchema } from '../inputTypeSchemas/PdpUrlWhereInputSchema'
import { PdpUrlOrderByWithRelationInputSchema } from '../inputTypeSchemas/PdpUrlOrderByWithRelationInputSchema'
import { PdpUrlWhereUniqueInputSchema } from '../inputTypeSchemas/PdpUrlWhereUniqueInputSchema'

export const PdpUrlAggregateArgsSchema: z.ZodType<Prisma.PdpUrlAggregateArgs> = z.object({
  where: PdpUrlWhereInputSchema.optional(),
  orderBy: z.union([ PdpUrlOrderByWithRelationInputSchema.array(),PdpUrlOrderByWithRelationInputSchema ]).optional(),
  cursor: PdpUrlWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PdpUrlAggregateArgsSchema;
