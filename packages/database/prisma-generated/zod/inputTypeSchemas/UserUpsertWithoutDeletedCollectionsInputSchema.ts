import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedCollectionsInputSchema } from './UserUpdateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCollectionsInputSchema } from './UserUncheckedUpdateWithoutDeletedCollectionsInputSchema';
import { UserCreateWithoutDeletedCollectionsInputSchema } from './UserCreateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedCreateWithoutDeletedCollectionsInputSchema } from './UserUncheckedCreateWithoutDeletedCollectionsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedCollectionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedCollectionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedCollectionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedCollectionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedCollectionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedCollectionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedCollectionsInputSchema;
