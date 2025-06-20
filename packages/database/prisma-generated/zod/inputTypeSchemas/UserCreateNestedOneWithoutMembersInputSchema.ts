import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutMembersInputSchema } from './UserCreateWithoutMembersInputSchema';
import { UserUncheckedCreateWithoutMembersInputSchema } from './UserUncheckedCreateWithoutMembersInputSchema';
import { UserCreateOrConnectWithoutMembersInputSchema } from './UserCreateOrConnectWithoutMembersInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutMembersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMembersInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMembersInputSchema),z.lazy(() => UserUncheckedCreateWithoutMembersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMembersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutMembersInputSchema;
