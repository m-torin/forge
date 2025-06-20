import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedFandomsInputSchema } from './UserCreateWithoutDeletedFandomsInputSchema';
import { UserUncheckedCreateWithoutDeletedFandomsInputSchema } from './UserUncheckedCreateWithoutDeletedFandomsInputSchema';

export const UserCreateOrConnectWithoutDeletedFandomsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedFandomsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedFandomsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedFandomsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedFandomsInputSchema;
