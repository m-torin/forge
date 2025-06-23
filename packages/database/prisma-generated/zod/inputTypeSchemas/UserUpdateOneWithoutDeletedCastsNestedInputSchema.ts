import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedCastsInputSchema } from './UserCreateWithoutDeletedCastsInputSchema';
import { UserUncheckedCreateWithoutDeletedCastsInputSchema } from './UserUncheckedCreateWithoutDeletedCastsInputSchema';
import { UserCreateOrConnectWithoutDeletedCastsInputSchema } from './UserCreateOrConnectWithoutDeletedCastsInputSchema';
import { UserUpsertWithoutDeletedCastsInputSchema } from './UserUpsertWithoutDeletedCastsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedCastsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedCastsInputSchema';
import { UserUpdateWithoutDeletedCastsInputSchema } from './UserUpdateWithoutDeletedCastsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCastsInputSchema } from './UserUncheckedUpdateWithoutDeletedCastsInputSchema';

export const UserUpdateOneWithoutDeletedCastsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedCastsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedCastsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedCastsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedCastsInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedCastsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedCastsInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedCastsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedCastsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedCastsNestedInputSchema;
