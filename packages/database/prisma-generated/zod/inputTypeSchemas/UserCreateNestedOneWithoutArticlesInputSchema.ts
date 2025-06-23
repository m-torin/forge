import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutArticlesInputSchema } from './UserCreateWithoutArticlesInputSchema';
import { UserUncheckedCreateWithoutArticlesInputSchema } from './UserUncheckedCreateWithoutArticlesInputSchema';
import { UserCreateOrConnectWithoutArticlesInputSchema } from './UserCreateOrConnectWithoutArticlesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutArticlesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutArticlesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutArticlesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutArticlesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutArticlesInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutArticlesInputSchema;
