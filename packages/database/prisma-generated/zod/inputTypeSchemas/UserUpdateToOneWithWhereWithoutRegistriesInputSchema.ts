import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutRegistriesInputSchema } from './UserUpdateWithoutRegistriesInputSchema';
import { UserUncheckedUpdateWithoutRegistriesInputSchema } from './UserUncheckedUpdateWithoutRegistriesInputSchema';

export const UserUpdateToOneWithWhereWithoutRegistriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRegistriesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutRegistriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutRegistriesInputSchema;
