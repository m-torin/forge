import { z } from 'zod';
import { InstanceCreateWithoutFlowsInputObjectSchema } from './InstanceCreateWithoutFlowsInput.schema';
import { InstanceUncheckedCreateWithoutFlowsInputObjectSchema } from './InstanceUncheckedCreateWithoutFlowsInput.schema';
import { InstanceCreateOrConnectWithoutFlowsInputObjectSchema } from './InstanceCreateOrConnectWithoutFlowsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InstanceCreateWithoutFlowsInputObjectSchema),
        z.lazy(() => InstanceUncheckedCreateWithoutFlowsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => InstanceCreateOrConnectWithoutFlowsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const InstanceCreateNestedOneWithoutFlowsInputObjectSchema = Schema;
