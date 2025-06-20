import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutCartsInputSchema } from './UserUpdateWithoutCartsInputSchema';
import { UserUncheckedUpdateWithoutCartsInputSchema } from './UserUncheckedUpdateWithoutCartsInputSchema';
import { UserCreateWithoutCartsInputSchema } from './UserCreateWithoutCartsInputSchema';
import { UserUncheckedCreateWithoutCartsInputSchema } from './UserUncheckedCreateWithoutCartsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutCartsInputSchema: z.ZodType<Prisma.UserUpsertWithoutCartsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutCartsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCartsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCartsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCartsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutCartsInputSchema;
