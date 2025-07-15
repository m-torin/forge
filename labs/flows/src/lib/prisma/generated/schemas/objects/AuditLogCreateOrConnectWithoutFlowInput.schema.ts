import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogCreateWithoutFlowInputObjectSchema } from './AuditLogCreateWithoutFlowInput.schema';
import { AuditLogUncheckedCreateWithoutFlowInputObjectSchema } from './AuditLogUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => AuditLogCreateWithoutFlowInputObjectSchema),
      z.lazy(() => AuditLogUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogCreateOrConnectWithoutFlowInputObjectSchema = Schema;
