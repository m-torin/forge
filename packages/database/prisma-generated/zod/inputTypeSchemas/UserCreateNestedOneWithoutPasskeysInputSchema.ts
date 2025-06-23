import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutPasskeysInputSchema } from './UserCreateWithoutPasskeysInputSchema';
import { UserUncheckedCreateWithoutPasskeysInputSchema } from './UserUncheckedCreateWithoutPasskeysInputSchema';
import { UserCreateOrConnectWithoutPasskeysInputSchema } from './UserCreateOrConnectWithoutPasskeysInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutPasskeysInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPasskeysInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutPasskeysInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasskeysInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutPasskeysInputSchema;
