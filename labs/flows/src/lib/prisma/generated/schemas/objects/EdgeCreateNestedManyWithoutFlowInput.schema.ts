import { z } from 'zod';
import { EdgeCreateWithoutFlowInputObjectSchema } from './EdgeCreateWithoutFlowInput.schema';
import { EdgeUncheckedCreateWithoutFlowInputObjectSchema } from './EdgeUncheckedCreateWithoutFlowInput.schema';
import { EdgeCreateOrConnectWithoutFlowInputObjectSchema } from './EdgeCreateOrConnectWithoutFlowInput.schema';
import { EdgeCreateManyFlowInputEnvelopeObjectSchema } from './EdgeCreateManyFlowInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const EdgeCreateNestedManyWithoutFlowInputObjectSchema = Schema;
