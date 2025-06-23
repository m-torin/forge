import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutPasskeysInputSchema } from './UserCreateWithoutPasskeysInputSchema';
import { UserUncheckedCreateWithoutPasskeysInputSchema } from './UserUncheckedCreateWithoutPasskeysInputSchema';
import { UserCreateOrConnectWithoutPasskeysInputSchema } from './UserCreateOrConnectWithoutPasskeysInputSchema';
import { UserUpsertWithoutPasskeysInputSchema } from './UserUpsertWithoutPasskeysInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutPasskeysInputSchema } from './UserUpdateToOneWithWhereWithoutPasskeysInputSchema';
import { UserUpdateWithoutPasskeysInputSchema } from './UserUpdateWithoutPasskeysInputSchema';
import { UserUncheckedUpdateWithoutPasskeysInputSchema } from './UserUncheckedUpdateWithoutPasskeysInputSchema';

export const UserUpdateOneRequiredWithoutPasskeysNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPasskeysNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutPasskeysInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPasskeysInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutPasskeysInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutPasskeysInputSchema),
          z.lazy(() => UserUpdateWithoutPasskeysInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutPasskeysInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutPasskeysNestedInputSchema;
