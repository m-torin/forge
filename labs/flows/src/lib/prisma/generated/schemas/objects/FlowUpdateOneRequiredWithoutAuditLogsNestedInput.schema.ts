import { z } from 'zod';
import { FlowCreateWithoutAuditLogsInputObjectSchema } from './FlowCreateWithoutAuditLogsInput.schema';
import { FlowUncheckedCreateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedCreateWithoutAuditLogsInput.schema';
import { FlowCreateOrConnectWithoutAuditLogsInputObjectSchema } from './FlowCreateOrConnectWithoutAuditLogsInput.schema';
import { FlowUpsertWithoutAuditLogsInputObjectSchema } from './FlowUpsertWithoutAuditLogsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutAuditLogsInput.schema';
import { FlowUpdateWithoutAuditLogsInputObjectSchema } from './FlowUpdateWithoutAuditLogsInput.schema';
import { FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './FlowUncheckedUpdateWithoutAuditLogsInput.schema';

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
    upsert: z
      .lazy(() => FlowUpsertWithoutAuditLogsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutAuditLogsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutAuditLogsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutAuditLogsNestedInputObjectSchema =
  Schema;
