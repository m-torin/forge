import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutRegistriesInputSchema } from './UserUpdateWithoutRegistriesInputSchema';
import { UserUncheckedUpdateWithoutRegistriesInputSchema } from './UserUncheckedUpdateWithoutRegistriesInputSchema';
import { UserCreateWithoutRegistriesInputSchema } from './UserCreateWithoutRegistriesInputSchema';
import { UserUncheckedCreateWithoutRegistriesInputSchema } from './UserUncheckedCreateWithoutRegistriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutRegistriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutRegistriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutRegistriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutRegistriesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutRegistriesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutRegistriesInputSchema;
