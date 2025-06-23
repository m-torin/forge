import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutAddressesInputSchema } from './UserUpdateWithoutAddressesInputSchema';
import { UserUncheckedUpdateWithoutAddressesInputSchema } from './UserUncheckedUpdateWithoutAddressesInputSchema';
import { UserCreateWithoutAddressesInputSchema } from './UserCreateWithoutAddressesInputSchema';
import { UserUncheckedCreateWithoutAddressesInputSchema } from './UserUncheckedCreateWithoutAddressesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutAddressesInputSchema: z.ZodType<Prisma.UserUpsertWithoutAddressesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutAddressesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutAddressesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutAddressesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutAddressesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutAddressesInputSchema;
