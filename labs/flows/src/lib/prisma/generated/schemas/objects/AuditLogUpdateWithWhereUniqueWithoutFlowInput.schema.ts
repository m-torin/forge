import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithoutFlowInputObjectSchema } from './AuditLogUpdateWithoutFlowInput.schema';
import { AuditLogUncheckedUpdateWithoutFlowInputObjectSchema } from './AuditLogUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => AuditLogUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => AuditLogUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
