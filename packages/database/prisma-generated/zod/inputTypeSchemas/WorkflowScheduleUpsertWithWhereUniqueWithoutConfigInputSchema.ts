import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleWhereUniqueInputSchema } from './WorkflowScheduleWhereUniqueInputSchema';
import { WorkflowScheduleUpdateWithoutConfigInputSchema } from './WorkflowScheduleUpdateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema';
import { WorkflowScheduleCreateWithoutConfigInputSchema } from './WorkflowScheduleCreateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedCreateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedCreateWithoutConfigInputSchema';

export const WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInput> =
  z
    .object({
      where: z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => WorkflowScheduleUpdateWithoutConfigInputSchema),
        z.lazy(() => WorkflowScheduleUncheckedUpdateWithoutConfigInputSchema),
      ]),
      create: z.union([
        z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema),
        z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema),
      ]),
    })
    .strict();

export default WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema;
