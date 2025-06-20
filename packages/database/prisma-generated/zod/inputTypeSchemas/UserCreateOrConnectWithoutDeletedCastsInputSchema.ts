import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedCastsInputSchema } from './UserCreateWithoutDeletedCastsInputSchema';
import { UserUncheckedCreateWithoutDeletedCastsInputSchema } from './UserUncheckedCreateWithoutDeletedCastsInputSchema';

export const UserCreateOrConnectWithoutDeletedCastsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedCastsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedCastsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedCastsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedCastsInputSchema;
