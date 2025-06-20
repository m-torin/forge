import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectWhereInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereInputSchema'
import { JrFindReplaceRejectOrderByWithRelationInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectOrderByWithRelationInputSchema'
import { JrFindReplaceRejectWhereUniqueInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereUniqueInputSchema'

export const JrFindReplaceRejectAggregateArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectAggregateArgs> = z.object({
  where: JrFindReplaceRejectWhereInputSchema.optional(),
  orderBy: z.union([ JrFindReplaceRejectOrderByWithRelationInputSchema.array(),JrFindReplaceRejectOrderByWithRelationInputSchema ]).optional(),
  cursor: JrFindReplaceRejectWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default JrFindReplaceRejectAggregateArgsSchema;
