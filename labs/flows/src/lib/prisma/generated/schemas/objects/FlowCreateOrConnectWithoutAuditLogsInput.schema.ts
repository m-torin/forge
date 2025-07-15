import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutAuditLogsInputObjectSchema } from './FlowCreateWithoutAuditLogsInput.schema';
import { FlowUncheckedCreateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedCreateWithoutAuditLogsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutAuditLogsInputObjectSchema = Schema;
