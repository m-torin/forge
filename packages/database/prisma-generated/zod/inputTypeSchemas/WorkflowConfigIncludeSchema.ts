import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleFindManyArgsSchema } from "../outputTypeSchemas/WorkflowScheduleFindManyArgsSchema"
import { WorkflowConfigCountOutputTypeArgsSchema } from "../outputTypeSchemas/WorkflowConfigCountOutputTypeArgsSchema"

export const WorkflowConfigIncludeSchema: z.ZodType<Prisma.WorkflowConfigInclude> = z.object({
  schedules: z.union([z.boolean(),z.lazy(() => WorkflowScheduleFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => WorkflowConfigCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default WorkflowConfigIncludeSchema;
