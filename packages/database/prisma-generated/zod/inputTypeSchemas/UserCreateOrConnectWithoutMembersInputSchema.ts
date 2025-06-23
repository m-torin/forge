import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutMembersInputSchema } from './UserCreateWithoutMembersInputSchema';
import { UserUncheckedCreateWithoutMembersInputSchema } from './UserUncheckedCreateWithoutMembersInputSchema';

export const UserCreateOrConnectWithoutMembersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMembersInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutMembersInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutMembersInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutMembersInputSchema;
