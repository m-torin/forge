import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigCreateWithoutSchedulesInputSchema } from './WorkflowConfigCreateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema';
import { WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema } from './WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema';
import { WorkflowConfigUpsertWithoutSchedulesInputSchema } from './WorkflowConfigUpsertWithoutSchedulesInputSchema';
import { WorkflowConfigWhereUniqueInputSchema } from './WorkflowConfigWhereUniqueInputSchema';
import { WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInputSchema } from './WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInputSchema';
import { WorkflowConfigUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUpdateWithoutSchedulesInputSchema';
import { WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema } from './WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema';

export const WorkflowConfigUpdateOneRequiredWithoutSchedulesNestedInputSchema: z.ZodType<Prisma.WorkflowConfigUpdateOneRequiredWithoutSchedulesNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorkflowConfigCreateWithoutSchedulesInputSchema),z.lazy(() => WorkflowConfigUncheckedCreateWithoutSchedulesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => WorkflowConfigCreateOrConnectWithoutSchedulesInputSchema).optional(),
  upsert: z.lazy(() => WorkflowConfigUpsertWithoutSchedulesInputSchema).optional(),
  connect: z.lazy(() => WorkflowConfigWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => WorkflowConfigUpdateToOneWithWhereWithoutSchedulesInputSchema),z.lazy(() => WorkflowConfigUpdateWithoutSchedulesInputSchema),z.lazy(() => WorkflowConfigUncheckedUpdateWithoutSchedulesInputSchema) ]).optional(),
}).strict();

export default WorkflowConfigUpdateOneRequiredWithoutSchedulesNestedInputSchema;
