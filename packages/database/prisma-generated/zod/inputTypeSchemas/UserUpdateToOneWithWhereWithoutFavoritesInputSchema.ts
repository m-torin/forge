import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutFavoritesInputSchema } from './UserUpdateWithoutFavoritesInputSchema';
import { UserUncheckedUpdateWithoutFavoritesInputSchema } from './UserUncheckedUpdateWithoutFavoritesInputSchema';

export const UserUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutFavoritesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutFavoritesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutFavoritesInputSchema;
