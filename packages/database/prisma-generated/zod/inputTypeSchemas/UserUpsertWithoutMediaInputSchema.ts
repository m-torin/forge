import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutMediaInputSchema } from './UserUpdateWithoutMediaInputSchema';
import { UserUncheckedUpdateWithoutMediaInputSchema } from './UserUncheckedUpdateWithoutMediaInputSchema';
import { UserCreateWithoutMediaInputSchema } from './UserCreateWithoutMediaInputSchema';
import { UserUncheckedCreateWithoutMediaInputSchema } from './UserUncheckedCreateWithoutMediaInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutMediaInputSchema: z.ZodType<Prisma.UserUpsertWithoutMediaInput> = z
  .object({
    update: z.union([
      z.lazy(() => UserUpdateWithoutMediaInputSchema),
      z.lazy(() => UserUncheckedUpdateWithoutMediaInputSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutMediaInputSchema),
      z.lazy(() => UserUncheckedCreateWithoutMediaInputSchema),
    ]),
    where: z.lazy(() => UserWhereInputSchema).optional(),
  })
  .strict();

export default UserUpsertWithoutMediaInputSchema;
