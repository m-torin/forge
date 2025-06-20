import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedFandomsInputSchema } from './UserCreateWithoutDeletedFandomsInputSchema';
import { UserUncheckedCreateWithoutDeletedFandomsInputSchema } from './UserUncheckedCreateWithoutDeletedFandomsInputSchema';
import { UserCreateOrConnectWithoutDeletedFandomsInputSchema } from './UserCreateOrConnectWithoutDeletedFandomsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedFandomsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedFandomsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedFandomsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedFandomsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedFandomsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedFandomsInputSchema;
