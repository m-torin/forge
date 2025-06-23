import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutOrdersInputSchema } from './UserUpdateWithoutOrdersInputSchema';
import { UserUncheckedUpdateWithoutOrdersInputSchema } from './UserUncheckedUpdateWithoutOrdersInputSchema';
import { UserCreateWithoutOrdersInputSchema } from './UserCreateWithoutOrdersInputSchema';
import { UserUncheckedCreateWithoutOrdersInputSchema } from './UserUncheckedCreateWithoutOrdersInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutOrdersInputSchema: z.ZodType<Prisma.UserUpsertWithoutOrdersInput> = z
  .object({
    update: z.union([
      z.lazy(() => UserUpdateWithoutOrdersInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutOrdersInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  })
  .strict();

export default UserUpsertWithoutOrdersInputSchema;
