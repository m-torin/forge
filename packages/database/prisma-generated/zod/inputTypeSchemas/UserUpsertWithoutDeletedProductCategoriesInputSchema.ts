import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUpdateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema';
import { UserCreateWithoutDeletedProductCategoriesInputSchema } from './UserCreateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedProductCategoriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedProductCategoriesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedProductCategoriesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductCategoriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedProductCategoriesInputSchema;
