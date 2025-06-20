import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutApiKeysInputSchema } from './UserCreateWithoutApiKeysInputSchema';
import { UserUncheckedCreateWithoutApiKeysInputSchema } from './UserUncheckedCreateWithoutApiKeysInputSchema';
import { UserCreateOrConnectWithoutApiKeysInputSchema } from './UserCreateOrConnectWithoutApiKeysInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutApiKeysInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutApiKeysInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutApiKeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutApiKeysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutApiKeysInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutApiKeysInputSchema;
