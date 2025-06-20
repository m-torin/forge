import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleWhereUniqueInputSchema } from './WorkflowScheduleWhereUniqueInputSchema';
import { WorkflowScheduleCreateWithoutConfigInputSchema } from './WorkflowScheduleCreateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedCreateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedCreateWithoutConfigInputSchema';

export const WorkflowScheduleCreateOrConnectWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleCreateOrConnectWithoutConfigInput> = z.object({
  where: z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema) ]),
}).strict();

export default WorkflowScheduleCreateOrConnectWithoutConfigInputSchema;
