import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigWhereInputSchema } from './WorkflowConfigWhereInputSchema';
import { WorkflowConfigUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUpdateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema';

export const WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInputSchema: z.ZodType<Prisma.WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInput> =
  z
    .object({
      where: z.lazy(() => WorkflowConfigWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => WorkflowConfigUpdateWithoutSchedulesInputSchema),
        z.lazy(() => WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema),
      ]),
    })
    .strict();

export default WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInputSchema;
