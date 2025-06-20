import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedMediaInputSchema } from './UserCreateWithoutDeletedMediaInputSchema';
import { UserUncheckedCreateWithoutDeletedMediaInputSchema } from './UserUncheckedCreateWithoutDeletedMediaInputSchema';
import { UserCreateOrConnectWithoutDeletedMediaInputSchema } from './UserCreateOrConnectWithoutDeletedMediaInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedMediaInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedMediaInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedMediaInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedMediaInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedMediaInputSchema;
