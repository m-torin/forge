import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutCreatedRegistriesInputSchema } from './UserCreateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedCreateWithoutCreatedRegistriesInputSchema } from './UserUncheckedCreateWithoutCreatedRegistriesInputSchema';

export const UserCreateOrConnectWithoutCreatedRegistriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCreatedRegistriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCreatedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutCreatedRegistriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutCreatedRegistriesInputSchema;
