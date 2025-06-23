import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedFandomsInputSchema } from './UserUpdateWithoutDeletedFandomsInputSchema';
import { UserUncheckedUpdateWithoutDeletedFandomsInputSchema } from './UserUncheckedUpdateWithoutDeletedFandomsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedFandomsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedFandomsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedFandomsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedFandomsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedFandomsInputSchema;
