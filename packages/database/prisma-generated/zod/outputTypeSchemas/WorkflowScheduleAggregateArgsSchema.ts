import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleWhereInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereInputSchema'
import { WorkflowScheduleOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorkflowScheduleOrderByWithRelationInputSchema'
import { WorkflowScheduleWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereUniqueInputSchema'

export const WorkflowScheduleAggregateArgsSchema: z.ZodType<Prisma.WorkflowScheduleAggregateArgs> = z.object({
  where: WorkflowScheduleWhereInputSchema.optional(),
  orderBy: z.union([ WorkflowScheduleOrderByWithRelationInputSchema.array(),WorkflowScheduleOrderByWithRelationInputSchema ]).optional(),
  cursor: WorkflowScheduleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorkflowScheduleAggregateArgsSchema;
