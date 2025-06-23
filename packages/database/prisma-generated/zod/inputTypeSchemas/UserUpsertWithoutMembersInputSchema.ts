import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutMembersInputSchema } from './UserUpdateWithoutMembersInputSchema';
import { UserUncheckedUpdateWithoutMembersInputSchema } from './UserUncheckedUpdateWithoutMembersInputSchema';
import { UserCreateWithoutMembersInputSchema } from './UserCreateWithoutMembersInputSchema';
import { UserUncheckedCreateWithoutMembersInputSchema } from './UserUncheckedCreateWithoutMembersInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutMembersInputSchema: z.ZodType<Prisma.UserUpsertWithoutMembersInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutMembersInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutMembersInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutMembersInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutMembersInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutMembersInputSchema;
