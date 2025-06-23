import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedMediaInputSchema } from './UserUpdateWithoutDeletedMediaInputSchema';
import { UserUncheckedUpdateWithoutDeletedMediaInputSchema } from './UserUncheckedUpdateWithoutDeletedMediaInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedMediaInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedMediaInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedMediaInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedMediaInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedMediaInputSchema;
