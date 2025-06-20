import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleCreateWithoutConfigInputSchema } from './WorkflowScheduleCreateWithoutConfigInputSchema';
import { WorkflowScheduleUncheckedCreateWithoutConfigInputSchema } from './WorkflowScheduleUncheckedCreateWithoutConfigInputSchema';
import { WorkflowScheduleCreateOrConnectWithoutConfigInputSchema } from './WorkflowScheduleCreateOrConnectWithoutConfigInputSchema';
import { WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema } from './WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema';
import { WorkflowScheduleCreateManyConfigInputEnvelopeSchema } from './WorkflowScheduleCreateManyConfigInputEnvelopeSchema';
import { WorkflowScheduleWhereUniqueInputSchema } from './WorkflowScheduleWhereUniqueInputSchema';
import { WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema } from './WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema';
import { WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema } from './WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema';
import { WorkflowScheduleScalarWhereInputSchema } from './WorkflowScheduleScalarWhereInputSchema';

export const WorkflowScheduleUncheckedUpdateManyWithoutConfigNestedInputSchema: z.ZodType<Prisma.WorkflowScheduleUncheckedUpdateManyWithoutConfigNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleCreateWithoutConfigInputSchema).array(),z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUncheckedCreateWithoutConfigInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorkflowScheduleCreateOrConnectWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleCreateOrConnectWithoutConfigInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUpsertWithWhereUniqueWithoutConfigInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorkflowScheduleCreateManyConfigInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),z.lazy(() => WorkflowScheduleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),z.lazy(() => WorkflowScheduleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),z.lazy(() => WorkflowScheduleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorkflowScheduleWhereUniqueInputSchema),z.lazy(() => WorkflowScheduleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUpdateWithWhereUniqueWithoutConfigInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema),z.lazy(() => WorkflowScheduleUpdateManyWithWhereWithoutConfigInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorkflowScheduleScalarWhereInputSchema),z.lazy(() => WorkflowScheduleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorkflowScheduleUncheckedUpdateManyWithoutConfigNestedInputSchema;
