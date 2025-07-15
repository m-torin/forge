import { z } from 'zod';
import { InstanceUpdateWithoutFlowsInputObjectSchema } from './InstanceUpdateWithoutFlowsInput.schema';
import { InstanceUncheckedUpdateWithoutFlowsInputObjectSchema } from './InstanceUncheckedUpdateWithoutFlowsInput.schema';
import { InstanceCreateWithoutFlowsInputObjectSchema } from './InstanceCreateWithoutFlowsInput.schema';
import { InstanceUncheckedCreateWithoutFlowsInputObjectSchema } from './InstanceUncheckedCreateWithoutFlowsInput.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => InstanceUpdateWithoutFlowsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutFlowsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputObjectSchema),
    ]),
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
  })
  .strict();

export const InstanceUpsertWithoutFlowsInputObjectSchema = Schema;
