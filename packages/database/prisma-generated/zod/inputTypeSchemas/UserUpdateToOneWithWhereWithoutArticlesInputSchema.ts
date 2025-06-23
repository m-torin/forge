import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutArticlesInputSchema } from './UserUpdateWithoutArticlesInputSchema';
import { UserUncheckedUpdateWithoutArticlesInputSchema } from './UserUncheckedUpdateWithoutArticlesInputSchema';

export const UserUpdateToOneWithWhereWithoutArticlesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutArticlesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutArticlesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutArticlesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutArticlesInputSchema;
