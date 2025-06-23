import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedMediaInputSchema } from './UserUpdateWithoutDeletedMediaInputSchema';
import { UserUncheckedUpdateWithoutDeletedMediaInputSchema } from './UserUncheckedUpdateWithoutDeletedMediaInputSchema';
import { UserCreateWithoutDeletedMediaInputSchema } from './UserCreateWithoutDeletedMediaInputSchema';
import { UserUncheckedCreateWithoutDeletedMediaInputSchema } from './UserUncheckedCreateWithoutDeletedMediaInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedMediaInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedMediaInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedMediaInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedMediaInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedMediaInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedMediaInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedMediaInputSchema;
