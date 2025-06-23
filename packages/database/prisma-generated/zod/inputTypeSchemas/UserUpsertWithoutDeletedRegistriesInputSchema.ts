import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedRegistriesInputSchema } from './UserUpdateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistriesInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistriesInputSchema';
import { UserCreateWithoutDeletedRegistriesInputSchema } from './UserCreateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistriesInputSchema } from './UserUncheckedCreateWithoutDeletedRegistriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedRegistriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedRegistriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedRegistriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedRegistriesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedRegistriesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedRegistriesInputSchema;
