import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedRegistryItemsInputSchema } from './UserCreateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema';
import { UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema } from './UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema';
import { UserUpsertWithoutDeletedRegistryItemsInputSchema } from './UserUpsertWithoutDeletedRegistryItemsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInputSchema';
import { UserUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUpdateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema';

export const UserUpdateOneWithoutDeletedRegistryItemsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedRegistryItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedRegistryItemsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUpdateWithoutDeletedRegistryItemsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistryItemsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedRegistryItemsNestedInputSchema;
