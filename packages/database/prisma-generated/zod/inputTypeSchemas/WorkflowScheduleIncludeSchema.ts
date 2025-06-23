import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigArgsSchema } from '../outputTypeSchemas/WorkflowConfigArgsSchema';

export const WorkflowScheduleIncludeSchema: z.ZodType<Prisma.WorkflowScheduleInclude> = z
  .object({
    config: z.union([z.boolean(), z.lazy(() => WorkflowConfigArgsSchema)]).optional(),
  })
  .strict();

export default WorkflowScheduleIncludeSchema;
