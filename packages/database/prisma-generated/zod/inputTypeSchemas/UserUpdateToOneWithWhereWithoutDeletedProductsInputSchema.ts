import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedProductsInputSchema } from './UserUpdateWithoutDeletedProductsInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductsInputSchema } from './UserUncheckedUpdateWithoutDeletedProductsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedProductsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedProductsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedProductsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedProductsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedProductsInputSchema;
