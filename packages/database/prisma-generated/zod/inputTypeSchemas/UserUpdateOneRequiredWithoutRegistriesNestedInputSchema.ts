import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutRegistriesInputSchema } from './UserCreateWithoutRegistriesInputSchema';
import { UserUncheckedCreateWithoutRegistriesInputSchema } from './UserUncheckedCreateWithoutRegistriesInputSchema';
import { UserCreateOrConnectWithoutRegistriesInputSchema } from './UserCreateOrConnectWithoutRegistriesInputSchema';
import { UserUpsertWithoutRegistriesInputSchema } from './UserUpsertWithoutRegistriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutRegistriesInputSchema } from './UserUpdateToOneWithWhereWithoutRegistriesInputSchema';
import { UserUpdateWithoutRegistriesInputSchema } from './UserUpdateWithoutRegistriesInputSchema';
import { UserUncheckedUpdateWithoutRegistriesInputSchema } from './UserUncheckedUpdateWithoutRegistriesInputSchema';

export const UserUpdateOneRequiredWithoutRegistriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRegistriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutRegistriesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutRegistriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRegistriesInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutRegistriesInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutRegistriesInputSchema),
          z.lazy(() => UserUpdateWithoutRegistriesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutRegistriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutRegistriesNestedInputSchema;
