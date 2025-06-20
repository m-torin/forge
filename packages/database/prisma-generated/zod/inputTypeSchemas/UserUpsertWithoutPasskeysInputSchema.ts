import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutPasskeysInputSchema } from './UserUpdateWithoutPasskeysInputSchema';
import { UserUncheckedUpdateWithoutPasskeysInputSchema } from './UserUncheckedUpdateWithoutPasskeysInputSchema';
import { UserCreateWithoutPasskeysInputSchema } from './UserCreateWithoutPasskeysInputSchema';
import { UserUncheckedCreateWithoutPasskeysInputSchema } from './UserUncheckedCreateWithoutPasskeysInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutPasskeysInputSchema: z.ZodType<Prisma.UserUpsertWithoutPasskeysInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPasskeysInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPasskeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutPasskeysInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutPasskeysInputSchema;
