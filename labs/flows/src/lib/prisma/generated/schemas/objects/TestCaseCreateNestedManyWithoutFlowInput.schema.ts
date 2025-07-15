import { z } from 'zod';
import { TestCaseCreateWithoutFlowInputObjectSchema } from './TestCaseCreateWithoutFlowInput.schema';
import { TestCaseUncheckedCreateWithoutFlowInputObjectSchema } from './TestCaseUncheckedCreateWithoutFlowInput.schema';
import { TestCaseCreateOrConnectWithoutFlowInputObjectSchema } from './TestCaseCreateOrConnectWithoutFlowInput.schema';
import { TestCaseCreateManyFlowInputEnvelopeObjectSchema } from './TestCaseCreateManyFlowInputEnvelope.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './TestCaseWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TestCaseCreateWithoutFlowInputObjectSchema),
        z.lazy(() => TestCaseCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputObjectSchema),
        z
          .lazy(() => TestCaseUncheckedCreateWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TestCaseCreateOrConnectWithoutFlowInputObjectSchema),
        z
          .lazy(() => TestCaseCreateOrConnectWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TestCaseCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TestCaseCreateNestedManyWithoutFlowInputObjectSchema = Schema;
