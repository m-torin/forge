import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedRegistriesInputSchema } from './UserCreateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistriesInputSchema } from './UserUncheckedCreateWithoutDeletedRegistriesInputSchema';
import { UserCreateOrConnectWithoutDeletedRegistriesInputSchema } from './UserCreateOrConnectWithoutDeletedRegistriesInputSchema';
import { UserUpsertWithoutDeletedRegistriesInputSchema } from './UserUpsertWithoutDeletedRegistriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedRegistriesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedRegistriesInputSchema';
import { UserUpdateWithoutDeletedRegistriesInputSchema } from './UserUpdateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistriesInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistriesInputSchema';

export const UserUpdateOneWithoutDeletedRegistriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedRegistriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedRegistriesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedRegistriesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUpdateWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistriesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedRegistriesNestedInputSchema;
