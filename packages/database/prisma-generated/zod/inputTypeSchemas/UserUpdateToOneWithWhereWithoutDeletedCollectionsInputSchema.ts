import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedCollectionsInputSchema } from './UserUpdateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCollectionsInputSchema } from './UserUncheckedUpdateWithoutDeletedCollectionsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedCollectionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedCollectionsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedCollectionsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedCollectionsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedCollectionsInputSchema;
