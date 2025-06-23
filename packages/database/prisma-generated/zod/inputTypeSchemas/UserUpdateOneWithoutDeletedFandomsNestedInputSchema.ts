import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedFandomsInputSchema } from './UserCreateWithoutDeletedFandomsInputSchema';
import { UserUncheckedCreateWithoutDeletedFandomsInputSchema } from './UserUncheckedCreateWithoutDeletedFandomsInputSchema';
import { UserCreateOrConnectWithoutDeletedFandomsInputSchema } from './UserCreateOrConnectWithoutDeletedFandomsInputSchema';
import { UserUpsertWithoutDeletedFandomsInputSchema } from './UserUpsertWithoutDeletedFandomsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedFandomsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedFandomsInputSchema';
import { UserUpdateWithoutDeletedFandomsInputSchema } from './UserUpdateWithoutDeletedFandomsInputSchema';
import { UserUncheckedUpdateWithoutDeletedFandomsInputSchema } from './UserUncheckedUpdateWithoutDeletedFandomsInputSchema';

export const UserUpdateOneWithoutDeletedFandomsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedFandomsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedFandomsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedFandomsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedFandomsInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedFandomsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedFandomsInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedFandomsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedFandomsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedFandomsNestedInputSchema;
