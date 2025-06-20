import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedArticlesInputSchema } from './UserUpdateWithoutDeletedArticlesInputSchema';
import { UserUncheckedUpdateWithoutDeletedArticlesInputSchema } from './UserUncheckedUpdateWithoutDeletedArticlesInputSchema';
import { UserCreateWithoutDeletedArticlesInputSchema } from './UserCreateWithoutDeletedArticlesInputSchema';
import { UserUncheckedCreateWithoutDeletedArticlesInputSchema } from './UserUncheckedCreateWithoutDeletedArticlesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedArticlesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedArticlesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedArticlesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedArticlesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedArticlesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedArticlesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedArticlesInputSchema;
