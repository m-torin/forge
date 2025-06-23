import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedMediaInputSchema } from './UserCreateWithoutDeletedMediaInputSchema';
import { UserUncheckedCreateWithoutDeletedMediaInputSchema } from './UserUncheckedCreateWithoutDeletedMediaInputSchema';
import { UserCreateOrConnectWithoutDeletedMediaInputSchema } from './UserCreateOrConnectWithoutDeletedMediaInputSchema';
import { UserUpsertWithoutDeletedMediaInputSchema } from './UserUpsertWithoutDeletedMediaInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedMediaInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedMediaInputSchema';
import { UserUpdateWithoutDeletedMediaInputSchema } from './UserUpdateWithoutDeletedMediaInputSchema';
import { UserUncheckedUpdateWithoutDeletedMediaInputSchema } from './UserUncheckedUpdateWithoutDeletedMediaInputSchema';

export const UserUpdateOneWithoutDeletedMediaNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedMediaNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedMediaInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedMediaInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedMediaInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedMediaInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedMediaInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedMediaInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedMediaNestedInputSchema;
