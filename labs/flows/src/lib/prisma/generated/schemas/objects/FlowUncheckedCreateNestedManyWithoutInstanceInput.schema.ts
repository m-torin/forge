import { z } from 'zod';
import { FlowCreateWithoutInstanceInputObjectSchema } from './FlowCreateWithoutInstanceInput.schema';
import { FlowUncheckedCreateWithoutInstanceInputObjectSchema } from './FlowUncheckedCreateWithoutInstanceInput.schema';
import { FlowCreateOrConnectWithoutInstanceInputObjectSchema } from './FlowCreateOrConnectWithoutInstanceInput.schema';
import { FlowCreateManyInstanceInputEnvelopeObjectSchema } from './FlowCreateManyInstanceInputEnvelope.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowWhereUniqueInputObjectSchema),
        z.lazy(() => FlowWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowUncheckedCreateNestedManyWithoutInstanceInputObjectSchema =
  Schema;
