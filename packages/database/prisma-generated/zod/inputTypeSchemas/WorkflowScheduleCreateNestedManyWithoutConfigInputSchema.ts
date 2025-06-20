import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleCreateWithoutConfigInputSchema } from './WorkflowScheduleCreateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedCreateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedCreateWithoutConfigInputSchema';
import { WorkflowScheduleCreateOrConnectWithoutConfigInputSchema } from './WorkflowScheduleCreateOrConnectWithoutConfigInputSchema';
import { WorkflowScheduleCreateManyConfigInputEnvelopeSchema } from './WorkflowScheduleCreateManyConfigInputEnvelopeSchema';
import { WorkflowScheduleWhereUniqueInputSchema } from './WorkflowScheduleWhereUniqueInputSchema';

export const WorkflowScheduleCreateNestedManyWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleCreateNestedManyWithoutConfigInput> = z.object({
  create: z.union([ z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema).array(),z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorkflowScheduleCreateOrConnectWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleCreateOrConnectWithoutConfigInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorkflowScheduleCreateManyConfigInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),z.lazy(() => WorkflowScheduleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorkflowScheduleCreateNestedManyWithoutConfigInputSchema;
