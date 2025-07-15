import { z } from 'zod';
import { FlowUpdateWithoutAuditLogsInputObjectSchema } from './FlowUpdateWithoutAuditLogsInput.schema';
import { FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedUpdateWithoutAuditLogsInput.schema';
import { FlowCreateWithoutAuditLogsInputObjectSchema } from './FlowCreateWithoutAuditLogsInput.schema';
import { FlowUncheckedCreateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedCreateWithoutAuditLogsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutAuditLogsInputObjectSchema = Schema;
