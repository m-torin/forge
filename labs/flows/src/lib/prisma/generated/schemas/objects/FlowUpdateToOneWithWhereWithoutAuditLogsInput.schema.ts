import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutAuditLogsInputObjectSchema } from './FlowUpdateWithoutAuditLogsInput.schema';
import { FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedUpdateWithoutAuditLogsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema = Schema;
