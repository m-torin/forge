import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedMediaInputSchema } from './UserCreateWithoutDeletedMediaInputSchema';
import { UserUncheckedCreateWithoutDeletedMediaInputSchema } from './UserUncheckedCreateWithoutDeletedMediaInputSchema';

export const UserCreateOrConnectWithoutDeletedMediaInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedMediaInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedMediaInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedMediaInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedMediaInputSchema;
