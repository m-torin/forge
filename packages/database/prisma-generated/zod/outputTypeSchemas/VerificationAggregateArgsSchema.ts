import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationWhereInputSchema } from '../inputTypeSchemas/VerificationWhereInputSchema'
import { VerificationOrderByWithRelationInputSchema } from '../inputTypeSchemas/VerificationOrderByWithRelationInputSchema'
import { VerificationWhereUniqueInputSchema } from '../inputTypeSchemas/VerificationWhereUniqueInputSchema'

export const VerificationAggregateArgsSchema: z.ZodType<Prisma.VerificationAggregateArgs> = z.object({
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default VerificationAggregateArgsSchema;
