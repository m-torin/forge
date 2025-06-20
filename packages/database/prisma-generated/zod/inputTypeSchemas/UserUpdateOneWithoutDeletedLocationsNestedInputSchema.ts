import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedLocationsInputSchema } from './UserCreateWithoutDeletedLocationsInputSchema';
import { UserUncheckedCreateWithoutDeletedLocationsInputSchema } from './UserUncheckedCreateWithoutDeletedLocationsInputSchema';
import { UserCreateOrConnectWithoutDeletedLocationsInputSchema } from './UserCreateOrConnectWithoutDeletedLocationsInputSchema';
import { UserUpsertWithoutDeletedLocationsInputSchema } from './UserUpsertWithoutDeletedLocationsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedLocationsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedLocationsInputSchema';
import { UserUpdateWithoutDeletedLocationsInputSchema } from './UserUpdateWithoutDeletedLocationsInputSchema';
import { UserUncheckedUpdateWithoutDeletedLocationsInputSchema } from './UserUncheckedUpdateWithoutDeletedLocationsInputSchema';

export const UserUpdateOneWithoutDeletedLocationsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedLocationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedLocationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedLocationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedLocationsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedLocationsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedLocationsInputSchema),z.lazy(() => UserUpdateWithoutDeletedLocationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedLocationsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedLocationsNestedInputSchema;
