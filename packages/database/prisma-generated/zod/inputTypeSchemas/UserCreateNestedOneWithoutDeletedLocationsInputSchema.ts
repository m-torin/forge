import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedLocationsInputSchema } from './UserCreateWithoutDeletedLocationsInputSchema';
import { UserUncheckedCreateWithoutDeletedLocationsInputSchema } from './UserUncheckedCreateWithoutDeletedLocationsInputSchema';
import { UserCreateOrConnectWithoutDeletedLocationsInputSchema } from './UserCreateOrConnectWithoutDeletedLocationsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedLocationsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedLocationsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedLocationsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedLocationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedLocationsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedLocationsInputSchema;
