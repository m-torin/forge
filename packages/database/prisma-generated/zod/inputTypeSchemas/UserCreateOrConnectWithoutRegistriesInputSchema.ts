import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutRegistriesInputSchema } from './UserCreateWithoutRegistriesInputSchema';
import { UserUncheckedCreateWithoutRegistriesInputSchema } from './UserUncheckedCreateWithoutRegistriesInputSchema';

export const UserCreateOrConnectWithoutRegistriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRegistriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRegistriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutRegistriesInputSchema;
