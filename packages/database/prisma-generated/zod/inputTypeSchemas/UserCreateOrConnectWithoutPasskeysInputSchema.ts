import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutPasskeysInputSchema } from './UserCreateWithoutPasskeysInputSchema';
import { UserUncheckedCreateWithoutPasskeysInputSchema } from './UserUncheckedCreateWithoutPasskeysInputSchema';

export const UserCreateOrConnectWithoutPasskeysInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPasskeysInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutPasskeysInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutPasskeysInputSchema;
