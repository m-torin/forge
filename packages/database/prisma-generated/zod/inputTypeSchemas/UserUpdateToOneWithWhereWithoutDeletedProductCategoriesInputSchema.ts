import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUpdateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedProductCategoriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInputSchema;
