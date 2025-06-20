import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleCreateManyConfigInputSchema } from './WorkflowScheduleCreateManyConfigInputSchema';

export const WorkflowScheduleCreateManyConfigInputEnvelopeSchema: z.ZodType<Prisma.WorkflowScheduleCreateManyConfigInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorkflowScheduleCreateManyConfigInputSchema),z.lazy(() => WorkflowScheduleCreateManyConfigInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorkflowScheduleCreateManyConfigInputEnvelopeSchema;
