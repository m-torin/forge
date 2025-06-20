import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedCollectionsInputSchema } from './UserCreateWithoutDeletedCollectionsInputSchema';
import { UserUncheckedCreateWithoutDeletedCollectionsInputSchema } from './UserUncheckedCreateWithoutDeletedCollectionsInputSchema';

export const UserCreateOrConnectWithoutDeletedCollectionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedCollectionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedCollectionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedCollectionsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedCollectionsInputSchema;
