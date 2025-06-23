import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutArticlesInputSchema } from './UserCreateWithoutArticlesInputSchema';
import { UserUncheckedCreateWithoutArticlesInputSchema } from './UserUncheckedCreateWithoutArticlesInputSchema';
import { UserCreateOrConnectWithoutArticlesInputSchema } from './UserCreateOrConnectWithoutArticlesInputSchema';
import { UserUpsertWithoutArticlesInputSchema } from './UserUpsertWithoutArticlesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutArticlesInputSchema } from './UserUpdateToOneWithWhereWithoutArticlesInputSchema';
import { UserUpdateWithoutArticlesInputSchema } from './UserUpdateWithoutArticlesInputSchema';
import { UserUncheckedUpdateWithoutArticlesInputSchema } from './UserUncheckedUpdateWithoutArticlesInputSchema';

export const UserUpdateOneWithoutArticlesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutArticlesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutArticlesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutArticlesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutArticlesInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutArticlesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutArticlesInputSchema),
          z.lazy(() => UserUpdateWithoutArticlesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutArticlesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutArticlesNestedInputSchema;
