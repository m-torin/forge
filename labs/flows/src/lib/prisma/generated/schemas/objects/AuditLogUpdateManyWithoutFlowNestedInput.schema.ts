import { z } from 'zod';
import { AuditLogCreateWithoutFlowInputObjectSchema } from './AuditLogCreateWithoutFlowInput.schema';
import { AuditLogUncheckedCreateWithoutFlowInputObjectSchema } from './AuditLogUncheckedCreateWithoutFlowInput.schema';
import { AuditLogCreateOrConnectWithoutFlowInputObjectSchema } from './AuditLogCreateOrConnectWithoutFlowInput.schema';
import { AuditLogUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './AuditLogUpsertWithWhereUniqueWithoutFlowInput.schema';
import { AuditLogCreateManyFlowInputEnvelopeObjectSchema } from './AuditLogCreateManyFlowInputEnvelope.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './AuditLogUpdateWithWhereUniqueWithoutFlowInput.schema';
import { AuditLogUpdateManyWithWhereWithoutFlowInputObjectSchema } from './AuditLogUpdateManyWithWhereWithoutFlowInput.schema';
import { AuditLogScalarWhereInputObjectSchema } from './AuditLogScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => AuditLogCreateWithoutFlowInputObjectSchema),
        z.lazy(() => AuditLogCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputObjectSchema),
        z
          .lazy(() => AuditLogUncheckedCreateWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => AuditLogCreateOrConnectWithoutFlowInputObjectSchema),
        z
          .lazy(() => AuditLogCreateOrConnectWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => AuditLogUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => AuditLogCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => AuditLogUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => AuditLogUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => AuditLogScalarWhereInputObjectSchema),
        z.lazy(() => AuditLogScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const AuditLogUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
