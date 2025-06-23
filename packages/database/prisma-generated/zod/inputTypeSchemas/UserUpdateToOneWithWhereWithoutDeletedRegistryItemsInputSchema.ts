import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUpdateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedRegistryItemsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInputSchema;
