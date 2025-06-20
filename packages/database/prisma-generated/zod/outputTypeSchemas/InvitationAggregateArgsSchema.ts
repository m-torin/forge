import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationWhereInputSchema } from '../inputTypeSchemas/InvitationWhereInputSchema'
import { InvitationOrderByWithRelationInputSchema } from '../inputTypeSchemas/InvitationOrderByWithRelationInputSchema'
import { InvitationWhereUniqueInputSchema } from '../inputTypeSchemas/InvitationWhereUniqueInputSchema'

export const InvitationAggregateArgsSchema: z.ZodType<Prisma.InvitationAggregateArgs> = z.object({
  where: InvitationWhereInputSchema.optional(),
  orderBy: z.union([ InvitationOrderByWithRelationInputSchema.array(),InvitationOrderByWithRelationInputSchema ]).optional(),
  cursor: InvitationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default InvitationAggregateArgsSchema;
