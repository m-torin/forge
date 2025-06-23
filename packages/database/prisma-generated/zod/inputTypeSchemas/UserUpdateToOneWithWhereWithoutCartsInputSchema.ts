import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutCartsInputSchema } from './UserUpdateWithoutCartsInputSchema';
import { UserUncheckedUpdateWithoutCartsInputSchema } from './UserUncheckedUpdateWithoutCartsInputSchema';

export const UserUpdateToOneWithWhereWithoutCartsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCartsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutCartsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutCartsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutCartsInputSchema;
