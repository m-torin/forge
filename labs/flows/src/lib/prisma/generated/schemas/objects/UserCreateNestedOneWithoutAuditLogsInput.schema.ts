import { z } from 'zod';
import { UserCreateWithoutAuditLogsInputObjectSchema } from './UserCreateWithoutAuditLogsInput.schema';
import { UserUncheckedCreateWithoutAuditLogsInputObjectSchema } from './UserUncheckedCreateWithoutAuditLogsInput.schema';
import { UserCreateOrConnectWithoutAuditLogsInputObjectSchema } from './UserCreateOrConnectWithoutAuditLogsInput.schema';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutAuditLogsInputObjectSchema),
        z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => UserCreateOrConnectWithoutAuditLogsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => UserWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const UserCreateNestedOneWithoutAuditLogsInputObjectSchema = Schema;
