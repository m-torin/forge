import { z } from 'zod';
import { UserCreateWithoutAuditLogsInputObjectSchema } from './UserCreateWithoutAuditLogsInput.schema';
import { UserUncheckedCreateWithoutAuditLogsInputObjectSchema } from './UserUncheckedCreateWithoutAuditLogsInput.schema';
import { UserCreateOrConnectWithoutAuditLogsInputObjectSchema } from './UserCreateOrConnectWithoutAuditLogsInput.schema';
import { UserUpsertWithoutAuditLogsInputObjectSchema } from './UserUpsertWithoutAuditLogsInput.schema';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';
import { UserUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema } from './UserUpdateToOneWithWhereWithoutAuditLogsInput.schema';
import { UserUpdateWithoutAuditLogsInputObjectSchema } from './UserUpdateWithoutAuditLogsInput.schema';
import { UserUncheckedUpdateWithoutAuditLogsInputObjectSchema } from './UserUncheckedUpdateWithoutAuditLogsInput.schema';

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
    upsert: z
      .lazy(() => UserUpsertWithoutAuditLogsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => UserWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutAuditLogsInputObjectSchema),
        z.lazy(() => UserUpdateWithoutAuditLogsInputObjectSchema),
        z.lazy(() => UserUncheckedUpdateWithoutAuditLogsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const UserUpdateOneRequiredWithoutAuditLogsNestedInputObjectSchema =
  Schema;
