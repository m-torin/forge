import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionWhereInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereInputSchema'
import { WorkflowExecutionOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorkflowExecutionOrderByWithRelationInputSchema'
import { WorkflowExecutionWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereUniqueInputSchema'

export const WorkflowExecutionAggregateArgsSchema: z.ZodType<Prisma.WorkflowExecutionAggregateArgs> = z.object({
  where: WorkflowExecutionWhereInputSchema.optional(),
  orderBy: z.union([ WorkflowExecutionOrderByWithRelationInputSchema.array(),WorkflowExecutionOrderByWithRelationInputSchema ]).optional(),
  cursor: WorkflowExecutionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorkflowExecutionAggregateArgsSchema;
