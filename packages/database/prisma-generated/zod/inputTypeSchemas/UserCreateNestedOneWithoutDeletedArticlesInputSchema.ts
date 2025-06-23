import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedArticlesInputSchema } from './UserCreateWithoutDeletedArticlesInputSchema';
import { UserUncheckedCreateWithoutDeletedArticlesInputSchema } from './UserUncheckedCreateWithoutDeletedArticlesInputSchema';
import { UserCreateOrConnectWithoutDeletedArticlesInputSchema } from './UserCreateOrConnectWithoutDeletedArticlesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedArticlesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedArticlesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedArticlesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedArticlesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutDeletedArticlesInputSchema)
        .optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutDeletedArticlesInputSchema;
