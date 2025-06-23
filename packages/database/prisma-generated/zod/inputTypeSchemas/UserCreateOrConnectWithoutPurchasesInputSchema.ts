import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutPurchasesInputSchema } from './UserCreateWithoutPurchasesInputSchema';
import { UserUncheckedCreateWithoutPurchasesInputSchema } from './UserUncheckedCreateWithoutPurchasesInputSchema';

export const UserCreateOrConnectWithoutPurchasesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPurchasesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutPurchasesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutPurchasesInputSchema;
