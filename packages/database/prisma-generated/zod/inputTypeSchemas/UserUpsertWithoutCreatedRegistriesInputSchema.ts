import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutCreatedRegistriesInputSchema } from './UserUpdateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutCreatedRegistriesInputSchema } from './UserUncheckedUpdateWithoutCreatedRegistriesInputSchema';
import { UserCreateWithoutCreatedRegistriesInputSchema } from './UserCreateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedCreateWithoutCreatedRegistriesInputSchema } from './UserUncheckedCreateWithoutCreatedRegistriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutCreatedRegistriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutCreatedRegistriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutCreatedRegistriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutCreatedRegistriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutCreatedRegistriesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutCreatedRegistriesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutCreatedRegistriesInputSchema;
