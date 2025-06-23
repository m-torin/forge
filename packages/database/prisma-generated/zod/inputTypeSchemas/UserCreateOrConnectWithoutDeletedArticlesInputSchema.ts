import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedArticlesInputSchema } from './UserCreateWithoutDeletedArticlesInputSchema';
import { UserUncheckedCreateWithoutDeletedArticlesInputSchema } from './UserUncheckedCreateWithoutDeletedArticlesInputSchema';

export const UserCreateOrConnectWithoutDeletedArticlesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedArticlesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedArticlesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedArticlesInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutDeletedArticlesInputSchema;
