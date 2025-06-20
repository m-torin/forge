import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUpdateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema';
import { WorkflowConfigCreateWithoutSchedulesInputSchema } from './WorkflowConfigCreateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema';
import { WorkflowConfigWhereInputSchema } from './WorkflowConfigWhereInputSchema';

export const WorkflowConfigUpsertWithoutSchedulesInputSchema: z.ZodType<Prisma.WorkflowConfigUpsertWithoutSchedulesInput> = z.object({
  update: z.union([ z.lazy(() => WorkflowConfigUpdateWithoutSchedulesInputSchema),z.lazy(() => WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema) ]),
  create: z.union([ z.lazy(() => WorkflowConfigCreateWithoutSchedulesInputSchema),z.lazy(() => WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema) ]),
  where: z.lazy(() => WorkflowConfigWhereInputSchema).optional()
}).strict();

export default WorkflowConfigUpsertWithoutSchedulesInputSchema;
