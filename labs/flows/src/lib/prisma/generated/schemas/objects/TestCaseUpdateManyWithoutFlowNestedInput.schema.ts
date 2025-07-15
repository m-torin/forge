import { z } from 'zod';
import { TestCaseCreateWithoutFlowInputObjectSchema } from './TestCaseCreateWithoutFlowInput.schema';
import { TestCaseUncheckedCreateWithoutFlowInputObjectSchema } from './TestCaseUncheckedCreateWithoutFlowInput.schema';
import { TestCaseCreateOrConnectWithoutFlowInputObjectSchema } from './TestCaseCreateOrConnectWithoutFlowInput.schema';
import { TestCaseUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './TestCaseUpsertWithWhereUniqueWithoutFlowInput.schema';
import { TestCaseCreateManyFlowInputEnvelopeObjectSchema } from './TestCaseCreateManyFlowInputEnvelope.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './TestCaseWhereUniqueInput.schema';
import { TestCaseUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './TestCaseUpdateWithWhereUniqueWithoutFlowInput.schema';
import { TestCaseUpdateManyWithWhereWithoutFlowInputObjectSchema } from './TestCaseUpdateManyWithWhereWithoutFlowInput.schema';
import { TestCaseScalarWhereInputObjectSchema } from './TestCaseScalarWhereInput.schema';

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
    upsert: z
      .union([
        z.lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => TestCaseUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TestCaseCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
        z.lazy(() => TestCaseWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => TestCaseUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => TestCaseUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => TestCaseScalarWhereInputObjectSchema),
        z.lazy(() => TestCaseScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TestCaseUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
