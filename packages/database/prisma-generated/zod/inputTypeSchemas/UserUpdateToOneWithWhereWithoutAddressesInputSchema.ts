import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutAddressesInputSchema } from './UserUpdateWithoutAddressesInputSchema';
import { UserUncheckedUpdateWithoutAddressesInputSchema } from './UserUncheckedUpdateWithoutAddressesInputSchema';

export const UserUpdateToOneWithWhereWithoutAddressesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAddressesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutAddressesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutAddressesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutAddressesInputSchema;
