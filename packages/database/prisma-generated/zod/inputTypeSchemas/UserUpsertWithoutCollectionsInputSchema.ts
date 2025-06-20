import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutCollectionsInputSchema } from './UserUpdateWithoutCollectionsInputSchema';
import { UserUncheckedUpdateWithoutCollectionsInputSchema } from './UserUncheckedUpdateWithoutCollectionsInputSchema';
import { UserCreateWithoutCollectionsInputSchema } from './UserCreateWithoutCollectionsInputSchema';
import { UserUncheckedCreateWithoutCollectionsInputSchema } from './UserUncheckedCreateWithoutCollectionsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutCollectionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutCollectionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutCollectionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCollectionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCollectionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollectionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutCollectionsInputSchema;
