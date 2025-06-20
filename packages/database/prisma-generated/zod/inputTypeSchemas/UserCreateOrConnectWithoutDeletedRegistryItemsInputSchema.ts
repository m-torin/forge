import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedRegistryItemsInputSchema } from './UserCreateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema';

export const UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedRegistryItemsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema;
