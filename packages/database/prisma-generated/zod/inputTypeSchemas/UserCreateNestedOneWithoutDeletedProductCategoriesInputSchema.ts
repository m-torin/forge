import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedProductCategoriesInputSchema } from './UserCreateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema';
import { UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema } from './UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedProductCategoriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedProductCategoriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductCategoriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedProductCategoriesInputSchema;
