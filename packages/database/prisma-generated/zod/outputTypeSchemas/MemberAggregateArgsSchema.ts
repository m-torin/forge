import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberWhereInputSchema } from '../inputTypeSchemas/MemberWhereInputSchema'
import { MemberOrderByWithRelationInputSchema } from '../inputTypeSchemas/MemberOrderByWithRelationInputSchema'
import { MemberWhereUniqueInputSchema } from '../inputTypeSchemas/MemberWhereUniqueInputSchema'

export const MemberAggregateArgsSchema: z.ZodType<Prisma.MemberAggregateArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithRelationInputSchema.array(),MemberOrderByWithRelationInputSchema ]).optional(),
  cursor: MemberWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MemberAggregateArgsSchema;
