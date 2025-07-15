import { z } from 'zod';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceCreateWithoutFlowsInputObjectSchema } from './InstanceCreateWithoutFlowsInput.schema';
import { InstanceUncheckedCreateWithoutFlowsInputObjectSchema } from './InstanceUncheckedCreateWithoutFlowsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutFlowsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceCreateOrConnectWithoutFlowsInputObjectSchema = Schema;
