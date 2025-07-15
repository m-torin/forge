import { z } from 'zod';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';
import { UserCreateWithoutAuditLogsInputObjectSchema } from './UserCreateWithoutAuditLogsInput.schema';
import { UserUncheckedCreateWithoutAuditLogsInputObjectSchema } from './UserUncheckedCreateWithoutAuditLogsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutAuditLogsInputObjectSchema),
      z.lazy(() => UserUncheckedCreateWithoutAuditLogsInputObjectSchema),
    ]),
  })
  .strict();

export const UserCreateOrConnectWithoutAuditLogsInputObjectSchema = Schema;
