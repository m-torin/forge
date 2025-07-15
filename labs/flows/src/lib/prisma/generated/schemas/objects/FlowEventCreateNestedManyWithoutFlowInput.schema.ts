import { z } from 'zod';
import { FlowEventCreateWithoutFlowInputObjectSchema } from './FlowEventCreateWithoutFlowInput.schema';
import { FlowEventUncheckedCreateWithoutFlowInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowInput.schema';
import { FlowEventCreateOrConnectWithoutFlowInputObjectSchema } from './FlowEventCreateOrConnectWithoutFlowInput.schema';
import { FlowEventCreateManyFlowInputEnvelopeObjectSchema } from './FlowEventCreateManyFlowInputEnvelope.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowEventCreateWithoutFlowInputObjectSchema),
        z.lazy(() => FlowEventCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowEventUncheckedCreateWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowEventCreateOrConnectWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowEventCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowEventCreateNestedManyWithoutFlowInputObjectSchema = Schema;
