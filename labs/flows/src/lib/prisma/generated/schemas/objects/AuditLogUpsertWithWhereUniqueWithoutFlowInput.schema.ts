import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithoutFlowInputObjectSchema } from './AuditLogUpdateWithoutFlowInput.schema';
import { AuditLogUncheckedUpdateWithoutFlowInputObjectSchema } from './AuditLogUncheckedUpdateWithoutFlowInput.schema';
import { AuditLogCreateWithoutFlowInputObjectSchema } from './AuditLogCreateWithoutFlowInput.schema';
import { AuditLogUncheckedCreateWithoutFlowInputObjectSchema } from './AuditLogUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => AuditLogUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => AuditLogUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => AuditLogCreateWithoutFlowInputObjectSchema),
      z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogUpsertWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
