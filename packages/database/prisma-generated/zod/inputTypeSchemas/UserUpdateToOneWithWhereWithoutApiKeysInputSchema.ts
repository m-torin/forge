import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutApiKeysInputSchema } from './UserUpdateWithoutApiKeysInputSchema';
import { UserUncheckedUpdateWithoutApiKeysInputSchema } from './UserUncheckedUpdateWithoutApiKeysInputSchema';

export const UserUpdateToOneWithWhereWithoutApiKeysInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutApiKeysInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutApiKeysInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutApiKeysInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutApiKeysInputSchema;
