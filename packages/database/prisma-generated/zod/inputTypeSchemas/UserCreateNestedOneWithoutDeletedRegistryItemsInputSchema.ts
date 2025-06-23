import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedRegistryItemsInputSchema } from './UserCreateWithoutDeletedRegistryItemsInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema } from './UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema';
import { UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema } from './UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedRegistryItemsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedRegistryItemsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedRegistryItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutDeletedRegistryItemsInputSchema)
        .optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema;
