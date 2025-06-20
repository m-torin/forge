import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutRegistriesInputSchema } from './UserCreateWithoutRegistriesInputSchema';
import { UserUncheckedCreateWithoutRegistriesInputSchema } from './UserUncheckedCreateWithoutRegistriesInputSchema';
import { UserCreateOrConnectWithoutRegistriesInputSchema } from './UserCreateOrConnectWithoutRegistriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutRegistriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRegistriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRegistriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutRegistriesInputSchema;
