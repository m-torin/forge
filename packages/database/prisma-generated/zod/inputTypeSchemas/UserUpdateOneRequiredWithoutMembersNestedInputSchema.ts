import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutMembersInputSchema } from './UserCreateWithoutMembersInputSchema';
import { UserUncheckedCreateWithoutMembersInputSchema } from './UserUncheckedCreateWithoutMembersInputSchema';
import { UserCreateOrConnectWithoutMembersInputSchema } from './UserCreateOrConnectWithoutMembersInputSchema';
import { UserUpsertWithoutMembersInputSchema } from './UserUpsertWithoutMembersInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutMembersInputSchema } from './UserUpdateToOneWithWhereWithoutMembersInputSchema';
import { UserUpdateWithoutMembersInputSchema } from './UserUpdateWithoutMembersInputSchema';
import { UserUncheckedUpdateWithoutMembersInputSchema } from './UserUncheckedUpdateWithoutMembersInputSchema';

export const UserUpdateOneRequiredWithoutMembersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMembersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutMembersInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutMembersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMembersInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutMembersInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutMembersInputSchema),
          z.lazy(() => UserUpdateWithoutMembersInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutMembersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutMembersNestedInputSchema;
