import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUpdateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema';
import { UserCreateWithoutDeletedRegistryItemsInputSchema } from './UserCreateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedRegistryItemsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedRegistryItemsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedRegistryItemsInputSchema;
