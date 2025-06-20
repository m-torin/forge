import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutArticlesInputSchema } from './UserUpdateWithoutArticlesInputSchema';
import { UserUncheckedUpdateWithoutArticlesInputSchema } from './UserUncheckedUpdateWithoutArticlesInputSchema';
import { UserCreateWithoutArticlesInputSchema } from './UserCreateWithoutArticlesInputSchema';
import { UserUncheckedCreateWithoutArticlesInputSchema } from './UserUncheckedCreateWithoutArticlesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutArticlesInputSchema: z.ZodType<Prisma.UserUpsertWithoutArticlesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutArticlesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutArticlesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutArticlesInputSchema),z.lazy(() => UserUncheckedCreateWithoutArticlesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutArticlesInputSchema;
