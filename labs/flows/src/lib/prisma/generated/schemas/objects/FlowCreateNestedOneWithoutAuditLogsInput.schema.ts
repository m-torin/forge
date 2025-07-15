import { z } from 'zod';
import { FlowCreateWithoutAuditLogsInputObjectSchema } from './FlowCreateWithoutAuditLogsInput.schema';
import { FlowUncheckedCreateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedCreateWithoutAuditLogsInput.schema';
import { FlowCreateOrConnectWithoutAuditLogsInputObjectSchema } from './FlowCreateOrConnectWithoutAuditLogsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutAuditLogsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutAuditLogsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutAuditLogsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutAuditLogsInputObjectSchema = Schema;
