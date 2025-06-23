import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedBrandsInputSchema } from './UserUpdateWithoutDeletedBrandsInputSchema';
import { UserUncheckedUpdateWithoutDeletedBrandsInputSchema } from './UserUncheckedUpdateWithoutDeletedBrandsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedBrandsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedBrandsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedBrandsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedBrandsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedBrandsInputSchema;
