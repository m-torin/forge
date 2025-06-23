import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutCreatedRegistriesInputSchema } from './UserUpdateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutCreatedRegistriesInputSchema } from './UserUncheckedUpdateWithoutCreatedRegistriesInputSchema';

export const UserUpdateToOneWithWhereWithoutCreatedRegistriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCreatedRegistriesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutCreatedRegistriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutCreatedRegistriesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutCreatedRegistriesInputSchema;
