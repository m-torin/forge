import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleScalarWhereInputSchema } from './WorkflowScheduleScalarWhereInputSchema';
import { WorkflowScheduleUpdateManyMutationInputSchema } from './WorkflowScheduleUpdateManyMutationInputSchema';
import { WorkflowScheduleUncheckedUpdateManyWithoutConfigInputSchema } from './WorkflowScheduleUncheckedUpdateManyWithoutConfigInputSchema';

export const WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleUpdateManyWithWhereWithoutConfigInput> = z.object({
  where: z.lazy(() => WorkflowScheduleScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorkflowScheduleUpdateManyMutationInputSchema),z.lazy(() => WorkflowScheduleUncheckedUpdateManyWithoutConfigInputSchema) ]),
}).strict();

export default WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema;
