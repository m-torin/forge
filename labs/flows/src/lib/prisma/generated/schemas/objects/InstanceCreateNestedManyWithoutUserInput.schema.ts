import { z } from 'zod';
import { InstanceCreateWithoutUserInputObjectSchema } from './InstanceCreateWithoutUserInput.schema';
import { InstanceUncheckedCreateWithoutUserInputObjectSchema } from './InstanceUncheckedCreateWithoutUserInput.schema';
import { InstanceCreateOrConnectWithoutUserInputObjectSchema } from './InstanceCreateOrConnectWithoutUserInput.schema';
import { InstanceCreateManyUserInputEnvelopeObjectSchema } from './InstanceCreateManyUserInputEnvelope.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InstanceCreateWithoutUserInputObjectSchema),
        z.lazy(() => InstanceCreateWithoutUserInputObjectSchema).array(),
        z.lazy(() => InstanceUncheckedCreateWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceUncheckedCreateWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => InstanceCreateOrConnectWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceCreateOrConnectWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => InstanceCreateManyUserInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => InstanceWhereUniqueInputObjectSchema),
        z.lazy(() => InstanceWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const InstanceCreateNestedManyWithoutUserInputObjectSchema = Schema;
