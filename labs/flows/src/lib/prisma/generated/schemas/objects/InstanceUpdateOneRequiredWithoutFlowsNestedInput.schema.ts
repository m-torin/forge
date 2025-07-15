import { z } from 'zod';
import { InstanceCreateWithoutFlowsInputObjectSchema } from './InstanceCreateWithoutFlowsInput.schema';
import { InstanceUncheckedCreateWithoutFlowsInputObjectSchema } from './InstanceUncheckedCreateWithoutFlowsInput.schema';
import { InstanceCreateOrConnectWithoutFlowsInputObjectSchema } from './InstanceCreateOrConnectWithoutFlowsInput.schema';
import { InstanceUpsertWithoutFlowsInputObjectSchema } from './InstanceUpsertWithoutFlowsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceUpdateToOneWithWhereWithoutFlowsInputObjectSchema } from './InstanceUpdateToOneWithWhereWithoutFlowsInput.schema';
import { InstanceUpdateWithoutFlowsInputObjectSchema } from './InstanceUpdateWithoutFlowsInput.schema';
import { InstanceUncheckedUpdateWithoutFlowsInputObjectSchema } from './InstanceUncheckedUpdateWithoutFlowsInput.schema';

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
    upsert: z
      .lazy(() => InstanceUpsertWithoutFlowsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => InstanceUpdateToOneWithWhereWithoutFlowsInputObjectSchema),
        z.lazy(() => InstanceUpdateWithoutFlowsInputObjectSchema),
        z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InstanceUpdateOneRequiredWithoutFlowsNestedInputObjectSchema =
  Schema;
