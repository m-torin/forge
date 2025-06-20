import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedFandomsInputSchema } from './UserUpdateWithoutDeletedFandomsInputSchema';
import { UserUncheckedUpdateWithoutDeletedFandomsInputSchema } from './UserUncheckedUpdateWithoutDeletedFandomsInputSchema';
import { UserCreateWithoutDeletedFandomsInputSchema } from './UserCreateWithoutDeletedFandomsInputSchema';
import { UserUncheckedCreateWithoutDeletedFandomsInputSchema } from './UserUncheckedCreateWithoutDeletedFandomsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedFandomsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedFandomsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedFandomsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedFandomsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedFandomsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedFandomsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedFandomsInputSchema;
