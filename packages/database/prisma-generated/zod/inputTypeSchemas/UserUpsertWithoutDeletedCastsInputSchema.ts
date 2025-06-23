import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedCastsInputSchema } from './UserUpdateWithoutDeletedCastsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCastsInputSchema } from './UserUncheckedUpdateWithoutDeletedCastsInputSchema';
import { UserCreateWithoutDeletedCastsInputSchema } from './UserCreateWithoutDeletedCastsInputSchema';
import { UserUncheckedCreateWithoutDeletedCastsInputSchema } from './UserUncheckedCreateWithoutDeletedCastsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedCastsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedCastsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedCastsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedCastsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedCastsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedCastsInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedCastsInputSchema;
