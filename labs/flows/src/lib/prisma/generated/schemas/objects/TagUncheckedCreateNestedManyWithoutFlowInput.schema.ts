import { z } from 'zod';
import { TagCreateWithoutFlowInputObjectSchema } from './TagCreateWithoutFlowInput.schema';
import { TagUncheckedCreateWithoutFlowInputObjectSchema } from './TagUncheckedCreateWithoutFlowInput.schema';
import { TagCreateOrConnectWithoutFlowInputObjectSchema } from './TagCreateOrConnectWithoutFlowInput.schema';
import { TagCreateManyFlowInputEnvelopeObjectSchema } from './TagCreateManyFlowInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutFlowInputObjectSchema),
        z.lazy(() => TagCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => TagUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => TagCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagUncheckedCreateNestedManyWithoutFlowInputObjectSchema = Schema;
