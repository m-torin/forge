import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigWhereUniqueInputSchema } from './WorkflowConfigWhereUniqueInputSchema';
import { WorkflowConfigCreateWithoutSchedulesInputSchema } from './WorkflowConfigCreateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema';

export const WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema: z.ZodType<Prisma.WorkflowConfigCreateOrConnectWithoutSchedulesInput> =
  z
    .object({
      where: z.lazy(() => WorkflowConfigWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => WorkflowConfigCreateWithoutSchedulesInputSchema),
        z.lazy(() => WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema),
      ]),
    })
    .strict();

export default WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema;
