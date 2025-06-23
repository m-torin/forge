import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionWhereInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereInputSchema';
import { WorkflowExecutionOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorkflowExecutionOrderByWithAggregationInputSchema';
import { WorkflowExecutionScalarFieldEnumSchema } from '../inputTypeSchemas/WorkflowExecutionScalarFieldEnumSchema';
import { WorkflowExecutionScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorkflowExecutionScalarWhereWithAggregatesInputSchema';

export const WorkflowExecutionGroupByArgsSchema: z.ZodType<Prisma.WorkflowExecutionGroupByArgs> = z
  .object({
    where: WorkflowExecutionWhereInputSchema.optional(),
    orderBy: z
      .union([
        WorkflowExecutionOrderByWithAggregationInputSchema.array(),
        WorkflowExecutionOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: WorkflowExecutionScalarFieldEnumSchema.array(),
    having: WorkflowExecutionScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default WorkflowExecutionGroupByArgsSchema;
