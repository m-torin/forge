import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedProductsInputSchema } from './UserUpdateWithoutDeletedProductsInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductsInputSchema } from './UserUncheckedUpdateWithoutDeletedProductsInputSchema';
import { UserCreateWithoutDeletedProductsInputSchema } from './UserCreateWithoutDeletedProductsInputSchema';
import { UserUncheckedCreateWithoutDeletedProductsInputSchema } from './UserUncheckedCreateWithoutDeletedProductsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedProductsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedProductsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedProductsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedProductsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedProductsInputSchema;
