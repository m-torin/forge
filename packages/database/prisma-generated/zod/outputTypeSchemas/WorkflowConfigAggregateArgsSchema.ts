import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigWhereInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereInputSchema';
import { WorkflowConfigOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorkflowConfigOrderByWithRelationInputSchema';
import { WorkflowConfigWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereUniqueInputSchema';

export const WorkflowConfigAggregateArgsSchema: z.ZodType<Prisma.WorkflowConfigAggregateArgs> = z
  .object({
    where: WorkflowConfigWhereInputSchema.optional(),
    orderBy: z
      .union([
        WorkflowConfigOrderByWithRelationInputSchema.array(),
        WorkflowConfigOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: WorkflowConfigWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default WorkflowConfigAggregateArgsSchema;
