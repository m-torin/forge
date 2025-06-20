import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutCreatedRegistriesInputSchema } from './UserCreateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedCreateWithoutCreatedRegistriesInputSchema } from './UserUncheckedCreateWithoutCreatedRegistriesInputSchema';
import { UserCreateOrConnectWithoutCreatedRegistriesInputSchema } from './UserCreateOrConnectWithoutCreatedRegistriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutCreatedRegistriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCreatedRegistriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCreatedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutCreatedRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCreatedRegistriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutCreatedRegistriesInputSchema;
