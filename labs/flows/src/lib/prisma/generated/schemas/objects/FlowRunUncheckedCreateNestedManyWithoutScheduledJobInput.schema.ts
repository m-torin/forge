import { z } from 'zod';
import { FlowRunCreateWithoutScheduledJobInputObjectSchema } from './FlowRunCreateWithoutScheduledJobInput.schema';
import { FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedCreateWithoutScheduledJobInput.schema';
import { FlowRunCreateOrConnectWithoutScheduledJobInputObjectSchema } from './FlowRunCreateOrConnectWithoutScheduledJobInput.schema';
import { FlowRunCreateManyScheduledJobInputEnvelopeObjectSchema } from './FlowRunCreateManyScheduledJobInputEnvelope.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';

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
    createMany: z
      .lazy(() => FlowRunCreateManyScheduledJobInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowRunUncheckedCreateNestedManyWithoutScheduledJobInputObjectSchema =
  Schema;
