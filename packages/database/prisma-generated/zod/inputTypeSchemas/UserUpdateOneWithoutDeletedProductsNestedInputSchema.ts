import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedProductsInputSchema } from './UserCreateWithoutDeletedProductsInputSchema';
import { UserUncheckedCreateWithoutDeletedProductsInputSchema } from './UserUncheckedCreateWithoutDeletedProductsInputSchema';
import { UserCreateOrConnectWithoutDeletedProductsInputSchema } from './UserCreateOrConnectWithoutDeletedProductsInputSchema';
import { UserUpsertWithoutDeletedProductsInputSchema } from './UserUpsertWithoutDeletedProductsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedProductsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedProductsInputSchema';
import { UserUpdateWithoutDeletedProductsInputSchema } from './UserUpdateWithoutDeletedProductsInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductsInputSchema } from './UserUncheckedUpdateWithoutDeletedProductsInputSchema';

export const UserUpdateOneWithoutDeletedProductsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedProductsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedProductsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedProductsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedProductsInputSchema),z.lazy(() => UserUpdateWithoutDeletedProductsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedProductsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedProductsNestedInputSchema;
