import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedArticlesInputSchema } from './UserCreateWithoutDeletedArticlesInputSchema';
import { UserUncheckedCreateWithoutDeletedArticlesInputSchema } from './UserUncheckedCreateWithoutDeletedArticlesInputSchema';
import { UserCreateOrConnectWithoutDeletedArticlesInputSchema } from './UserCreateOrConnectWithoutDeletedArticlesInputSchema';
import { UserUpsertWithoutDeletedArticlesInputSchema } from './UserUpsertWithoutDeletedArticlesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedArticlesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedArticlesInputSchema';
import { UserUpdateWithoutDeletedArticlesInputSchema } from './UserUpdateWithoutDeletedArticlesInputSchema';
import { UserUncheckedUpdateWithoutDeletedArticlesInputSchema } from './UserUncheckedUpdateWithoutDeletedArticlesInputSchema';

export const UserUpdateOneWithoutDeletedArticlesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedArticlesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedArticlesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedArticlesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedArticlesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedArticlesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedArticlesInputSchema),z.lazy(() => UserUpdateWithoutDeletedArticlesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedArticlesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedArticlesNestedInputSchema;
