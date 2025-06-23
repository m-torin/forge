import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleWhereInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereInputSchema';
import { WorkflowScheduleOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorkflowScheduleOrderByWithAggregationInputSchema';
import { WorkflowScheduleScalarFieldEnumSchema } from '../inputTypeSchemas/WorkflowScheduleScalarFieldEnumSchema';
import { WorkflowScheduleScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorkflowScheduleScalarWhereWithAggregatesInputSchema';

export const WorkflowScheduleGroupByArgsSchema: z.ZodType<Prisma.WorkflowScheduleGroupByArgs> = z
  .object({
    where: WorkflowScheduleWhereInputSchema.optional(),
    orderBy: z
      .union([
        WorkflowScheduleOrderByWithAggregationInputSchema.array(),
        WorkflowScheduleOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: WorkflowScheduleScalarFieldEnumSchema.array(),
    having: WorkflowScheduleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default WorkflowScheduleGroupByArgsSchema;
