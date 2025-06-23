import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigCreateWithoutSchedulesInputSchema } from './WorkflowConfigCreateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema';
import { WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema } from './WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema';
import { WorkflowConfigWhereUniqueInputSchema } from './WorkflowConfigWhereUniqueInputSchema';

export const WorkflowConfigCreateNestedOneWithoutSchedulesInputSchema: z.ZodType<Prisma.WorkflowConfigCreateNestedOneWithoutSchedulesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => WorkflowConfigCreateWithoutSchedulesInputSchema),
          z.lazy(() => WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema)
        .optional(),
      connect: z.lazy(() => WorkflowConfigWhereUniqueInputSchema).optional(),
    })
    .strict();

export default WorkflowConfigCreateNestedOneWithoutSchedulesInputSchema;
