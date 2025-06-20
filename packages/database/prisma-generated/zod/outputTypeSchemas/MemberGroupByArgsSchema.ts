import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberWhereInputSchema } from '../inputTypeSchemas/MemberWhereInputSchema'
import { MemberOrderByWithAggregationInputSchema } from '../inputTypeSchemas/MemberOrderByWithAggregationInputSchema'
import { MemberScalarFieldEnumSchema } from '../inputTypeSchemas/MemberScalarFieldEnumSchema'
import { MemberScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/MemberScalarWhereWithAggregatesInputSchema'

export const MemberGroupByArgsSchema: z.ZodType<Prisma.MemberGroupByArgs> = z.object({
  where: MemberWhereInputSchema.optional(),
  orderBy: z.union([ MemberOrderByWithAggregationInputSchema.array(),MemberOrderByWithAggregationInputSchema ]).optional(),
  by: MemberScalarFieldEnumSchema.array(),
  having: MemberScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default MemberGroupByArgsSchema;
