import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedProductCategoriesInputSchema } from './UserCreateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema';

export const UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedProductCategoriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductCategoriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema;
