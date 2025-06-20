import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedProductsInputSchema } from './UserCreateWithoutDeletedProductsInputSchema';
import { UserUncheckedCreateWithoutDeletedProductsInputSchema } from './UserUncheckedCreateWithoutDeletedProductsInputSchema';
import { UserCreateOrConnectWithoutDeletedProductsInputSchema } from './UserCreateOrConnectWithoutDeletedProductsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedProductsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedProductsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedProductsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedProductsInputSchema;
