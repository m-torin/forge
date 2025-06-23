import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedCollectionsInputSchema } from './UserCreateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedCreateWithoutDeletedCollectionsInputSchema } from './UserUncheckedCreateWithoutDeletedCollectionsInputSchema';
import { UserCreateOrConnectWithoutDeletedCollectionsInputSchema } from './UserCreateOrConnectWithoutDeletedCollectionsInputSchema';
import { UserUpsertWithoutDeletedCollectionsInputSchema } from './UserUpsertWithoutDeletedCollectionsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedCollectionsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedCollectionsInputSchema';
import { UserUpdateWithoutDeletedCollectionsInputSchema } from './UserUpdateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCollectionsInputSchema } from './UserUncheckedUpdateWithoutDeletedCollectionsInputSchema';

export const UserUpdateOneWithoutDeletedCollectionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedCollectionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedCollectionsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedCollectionsInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutDeletedCollectionsInputSchema)
        .optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedCollectionsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedCollectionsInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedCollectionsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedCollectionsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedCollectionsNestedInputSchema;
