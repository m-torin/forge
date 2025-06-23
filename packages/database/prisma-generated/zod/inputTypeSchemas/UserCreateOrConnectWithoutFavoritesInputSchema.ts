import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutFavoritesInputSchema } from './UserCreateWithoutFavoritesInputSchema';
import { UserUncheckedCreateWithoutFavoritesInputSchema } from './UserUncheckedCreateWithoutFavoritesInputSchema';

export const UserCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutFavoritesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutFavoritesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutFavoritesInputSchema;
