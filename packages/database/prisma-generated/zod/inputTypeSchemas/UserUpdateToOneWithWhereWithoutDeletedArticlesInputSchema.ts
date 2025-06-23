import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedArticlesInputSchema } from './UserUpdateWithoutDeletedArticlesInputSchema';
import { UserUncheckedUpdateWithoutDeletedArticlesInputSchema } from './UserUncheckedUpdateWithoutDeletedArticlesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedArticlesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedArticlesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedArticlesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedArticlesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedArticlesInputSchema;
