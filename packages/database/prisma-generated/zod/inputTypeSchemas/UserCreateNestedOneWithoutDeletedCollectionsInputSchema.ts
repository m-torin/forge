import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedCollectionsInputSchema } from './UserCreateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedCreateWithoutDeletedCollectionsInputSchema } from './UserUncheckedCreateWithoutDeletedCollectionsInputSchema';
import { UserCreateOrConnectWithoutDeletedCollectionsInputSchema } from './UserCreateOrConnectWithoutDeletedCollectionsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedCollectionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedCollectionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedCollectionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedCollectionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedCollectionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedCollectionsInputSchema;
