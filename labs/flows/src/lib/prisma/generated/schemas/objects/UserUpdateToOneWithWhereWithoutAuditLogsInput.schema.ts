import { z } from 'zod';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { UserUpdateWithoutAuditLogsInputObjectSchema } from './UserUpdateWithoutAuditLogsInput.schema';
import { UserUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './UserUncheckedUpdateWithoutAuditLogsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputObjectSchema),
    ]),
  })
  .strict();

export const UserUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema = Schema;
