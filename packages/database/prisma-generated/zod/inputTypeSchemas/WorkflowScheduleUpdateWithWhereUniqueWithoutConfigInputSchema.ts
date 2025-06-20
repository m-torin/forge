import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleWhereUniqueInputSchema } from './WorkflowScheduleWhereUniqueInputSchema';
import { WorkflowScheduleUpdateWithoutConfigInputSchema } from './WorkflowScheduleUpdateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema';

export const WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInput> = z.object({
  where: z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorkflowScheduleUpdateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema) ]),
}).strict();

export default WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema;
