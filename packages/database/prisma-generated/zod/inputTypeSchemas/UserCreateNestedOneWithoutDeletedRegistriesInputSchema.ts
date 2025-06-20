import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedRegistriesInputSchema } from './UserCreateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistriesInputSchema } from './UserUncheckedCreateWithoutDeletedRegistriesInputSchema';
import { UserCreateOrConnectWithoutDeletedRegistriesInputSchema } from './UserCreateOrConnectWithoutDeletedRegistriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedRegistriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedRegistriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedRegistriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedRegistriesInputSchema;
