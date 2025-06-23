import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedProductsInputSchema } from './UserCreateWithoutDeletedProductsInputSchema';
import { UserUncheckedCreateWithoutDeletedProductsInputSchema } from './UserUncheckedCreateWithoutDeletedProductsInputSchema';

export const UserCreateOrConnectWithoutDeletedProductsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedProductsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedProductsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedProductsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutDeletedProductsInputSchema;
