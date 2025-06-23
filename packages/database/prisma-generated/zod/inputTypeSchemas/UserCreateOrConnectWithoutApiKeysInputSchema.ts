import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutApiKeysInputSchema } from './UserCreateWithoutApiKeysInputSchema';
import { UserUncheckedCreateWithoutApiKeysInputSchema } from './UserUncheckedCreateWithoutApiKeysInputSchema';

export const UserCreateOrConnectWithoutApiKeysInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutApiKeysInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutApiKeysInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutApiKeysInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutApiKeysInputSchema;
