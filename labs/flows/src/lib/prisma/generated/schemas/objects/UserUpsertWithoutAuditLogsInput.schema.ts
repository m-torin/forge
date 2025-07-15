import { z } from 'zod';
import { UserUpdateWithoutAuditLogsInputObjectSchema } from './UserUpdateWithoutAuditLogsInput.schema';
import { UserUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './UserUncheckedUpdateWithoutAuditLogsInput.schema';
import { UserCreateWithoutAuditLogsInputObjectSchema } from './UserCreateWithoutAuditLogsInput.schema';
import { UserUncheckedCreateWithoutAuditLogsInputObjectSchema } from './UserUncheckedCreateWithoutAuditLogsInput.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => UserUpdateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputObjectSchema),
    ]),
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
  })
  .strict();

export const UserUpsertWithoutAuditLogsInputObjectSchema = Schema;
