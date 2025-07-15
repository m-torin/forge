import { z } from 'zod';
import { AuditLogCreateWithoutUserInputObjectSchema } from './AuditLogCreateWithoutUserInput.schema';
import { AuditLogUncheckedCreateWithoutUserInputObjectSchema } from './AuditLogUncheckedCreateWithoutUserInput.schema';
import { AuditLogCreateOrConnectWithoutUserInputObjectSchema } from './AuditLogCreateOrConnectWithoutUserInput.schema';
import { AuditLogUpsertWithWhereUniqueWithoutUserInputObjectSchema } from './AuditLogUpsertWithWhereUniqueWithoutUserInput.schema';
import { AuditLogCreateManyUserInputEnvelopeObjectSchema } from './AuditLogCreateManyUserInputEnvelope.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithWhereUniqueWithoutUserInputObjectSchema } from './AuditLogUpdateWithWhereUniqueWithoutUserInput.schema';
import { AuditLogUpdateManyWithWhereWithoutUserInputObjectSchema } from './AuditLogUpdateManyWithWhereWithoutUserInput.schema';
import { AuditLogScalarWhereInputObjectSchema } from './AuditLogScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => AuditLogCreateWithoutUserInputObjectSchema),
        z.lazy(() => AuditLogCreateWithoutUserInputObjectSchema).array(),
        z.lazy(() => AuditLogUncheckedCreateWithoutUserInputObjectSchema),
        z
          .lazy(() => AuditLogUncheckedCreateWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => AuditLogCreateOrConnectWithoutUserInputObjectSchema),
        z
          .lazy(() => AuditLogCreateOrConnectWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputObjectSchema),
        z
          .lazy(() => AuditLogUpsertWithWhereUniqueWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => AuditLogCreateManyUserInputEnvelopeObjectSchema)
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
        z.lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputObjectSchema),
        z
          .lazy(() => AuditLogUpdateWithWhereUniqueWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputObjectSchema),
        z
          .lazy(() => AuditLogUpdateManyWithWhereWithoutUserInputObjectSchema)
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

export const AuditLogUpdateManyWithoutUserNestedInputObjectSchema = Schema;
