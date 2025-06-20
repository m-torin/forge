import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutTwoFactorInputSchema } from './UserUpdateWithoutTwoFactorInputSchema';
import { UserUncheckedUpdateWithoutTwoFactorInputSchema } from './UserUncheckedUpdateWithoutTwoFactorInputSchema';
import { UserCreateWithoutTwoFactorInputSchema } from './UserCreateWithoutTwoFactorInputSchema';
import { UserUncheckedCreateWithoutTwoFactorInputSchema } from './UserUncheckedCreateWithoutTwoFactorInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutTwoFactorInputSchema: z.ZodType<Prisma.UserUpsertWithoutTwoFactorInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTwoFactorInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedCreateWithoutTwoFactorInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutTwoFactorInputSchema;
