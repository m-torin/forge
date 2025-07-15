import { z } from 'zod';
import { FlowRunCreateWithoutScheduledJobInputObjectSchema } from './FlowRunCreateWithoutScheduledJobInput.schema';
import { FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedCreateWithoutScheduledJobInput.schema';
import { FlowRunCreateOrConnectWithoutScheduledJobInputObjectSchema } from './FlowRunCreateOrConnectWithoutScheduledJobInput.schema';
import { FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputObjectSchema } from './FlowRunUpsertWithWhereUniqueWithoutScheduledJobInput.schema';
import { FlowRunCreateManyScheduledJobInputEnvelopeObjectSchema } from './FlowRunCreateManyScheduledJobInputEnvelope.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputObjectSchema } from './FlowRunUpdateWithWhereUniqueWithoutScheduledJobInput.schema';
import { FlowRunUpdateManyWithWhereWithoutScheduledJobInputObjectSchema } from './FlowRunUpdateManyWithWhereWithoutScheduledJobInput.schema';
import { FlowRunScalarWhereInputObjectSchema } from './FlowRunScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowRunCreateWithoutScheduledJobInputObjectSchema),
        z.lazy(() => FlowRunCreateWithoutScheduledJobInputObjectSchema).array(),
        z.lazy(
          () => FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(
          () => FlowRunCreateOrConnectWithoutScheduledJobInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowRunCreateOrConnectWithoutScheduledJobInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () =>
            FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputObjectSchema,
        ),
        z
          .lazy(
            () =>
              FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(
          () =>
            FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputObjectSchema,
        ),
        z
          .lazy(
            () =>
              FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(
          () => FlowRunUpdateManyWithWhereWithoutScheduledJobInputObjectSchema,
        ),
        z
          .lazy(
            () =>
              FlowRunUpdateManyWithWhereWithoutScheduledJobInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => FlowRunScalarWhereInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowRunUpdateManyWithoutScheduledJobNestedInputObjectSchema =
  Schema;
