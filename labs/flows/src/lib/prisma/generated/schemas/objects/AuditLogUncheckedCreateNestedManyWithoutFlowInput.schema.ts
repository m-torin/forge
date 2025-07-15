import { z } from 'zod';
import { AuditLogCreateWithoutFlowInputObjectSchema } from './AuditLogCreateWithoutFlowInput.schema';
import { AuditLogUncheckedCreateWithoutFlowInputObjectSchema } from './AuditLogUncheckedCreateWithoutFlowInput.schema';
import { AuditLogCreateOrConnectWithoutFlowInputObjectSchema } from './AuditLogCreateOrConnectWithoutFlowInput.schema';
import { AuditLogCreateManyFlowInputEnvelopeObjectSchema } from './AuditLogCreateManyFlowInputEnvelope.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';

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
    createMany: z
      .lazy(() => AuditLogCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
        z.lazy(() => AuditLogWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const AuditLogUncheckedCreateNestedManyWithoutFlowInputObjectSchema =
  Schema;
