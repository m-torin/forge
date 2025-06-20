import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigWhereInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereInputSchema'
import { WorkflowConfigOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorkflowConfigOrderByWithAggregationInputSchema'
import { WorkflowConfigScalarFieldEnumSchema } from '../inputTypeSchemas/WorkflowConfigScalarFieldEnumSchema'
import { WorkflowConfigScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorkflowConfigScalarWhereWithAggregatesInputSchema'

export const WorkflowConfigGroupByArgsSchema: z.ZodType<Prisma.WorkflowConfigGroupByArgs> = z.object({
  where: WorkflowConfigWhereInputSchema.optional(),
  orderBy: z.union([ WorkflowConfigOrderByWithAggregationInputSchema.array(),WorkflowConfigOrderByWithAggregationInputSchema ]).optional(),
  by: WorkflowConfigScalarFieldEnumSchema.array(),
  having: WorkflowConfigScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorkflowConfigGroupByArgsSchema;
