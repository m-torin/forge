import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutCreatedRegistriesInputSchema } from './UserCreateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedCreateWithoutCreatedRegistriesInputSchema } from './UserUncheckedCreateWithoutCreatedRegistriesInputSchema';
import { UserCreateOrConnectWithoutCreatedRegistriesInputSchema } from './UserCreateOrConnectWithoutCreatedRegistriesInputSchema';
import { UserUpsertWithoutCreatedRegistriesInputSchema } from './UserUpsertWithoutCreatedRegistriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutCreatedRegistriesInputSchema } from './UserUpdateToOneWithWhereWithoutCreatedRegistriesInputSchema';
import { UserUpdateWithoutCreatedRegistriesInputSchema } from './UserUpdateWithoutCreatedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutCreatedRegistriesInputSchema } from './UserUncheckedUpdateWithoutCreatedRegistriesInputSchema';

export const UserUpdateOneWithoutCreatedRegistriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutCreatedRegistriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCreatedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutCreatedRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCreatedRegistriesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCreatedRegistriesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCreatedRegistriesInputSchema),z.lazy(() => UserUpdateWithoutCreatedRegistriesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCreatedRegistriesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutCreatedRegistriesNestedInputSchema;
