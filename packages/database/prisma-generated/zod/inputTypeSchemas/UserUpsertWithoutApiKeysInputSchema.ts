import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutApiKeysInputSchema } from './UserUpdateWithoutApiKeysInputSchema';
import { UserUncheckedUpdateWithoutApiKeysInputSchema } from './UserUncheckedUpdateWithoutApiKeysInputSchema';
import { UserCreateWithoutApiKeysInputSchema } from './UserCreateWithoutApiKeysInputSchema';
import { UserUncheckedCreateWithoutApiKeysInputSchema } from './UserUncheckedCreateWithoutApiKeysInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutApiKeysInputSchema: z.ZodType<Prisma.UserUpsertWithoutApiKeysInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutApiKeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutApiKeysInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutApiKeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutApiKeysInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutApiKeysInputSchema;
