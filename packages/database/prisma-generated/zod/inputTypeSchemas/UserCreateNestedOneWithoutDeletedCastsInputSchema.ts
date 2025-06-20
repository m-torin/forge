import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedCastsInputSchema } from './UserCreateWithoutDeletedCastsInputSchema';
import { UserUncheckedCreateWithoutDeletedCastsInputSchema } from './UserUncheckedCreateWithoutDeletedCastsInputSchema';
import { UserCreateOrConnectWithoutDeletedCastsInputSchema } from './UserCreateOrConnectWithoutDeletedCastsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedCastsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedCastsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedCastsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedCastsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedCastsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedCastsInputSchema;
