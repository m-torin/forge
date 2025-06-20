import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutFavoritesInputSchema } from './UserUpdateWithoutFavoritesInputSchema';
import { UserUncheckedUpdateWithoutFavoritesInputSchema } from './UserUncheckedUpdateWithoutFavoritesInputSchema';
import { UserCreateWithoutFavoritesInputSchema } from './UserCreateWithoutFavoritesInputSchema';
import { UserUncheckedCreateWithoutFavoritesInputSchema } from './UserUncheckedCreateWithoutFavoritesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUpsertWithoutFavoritesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutFavoritesInputSchema;
