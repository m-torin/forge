import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedLocationsInputSchema } from './UserCreateWithoutDeletedLocationsInputSchema';
import { UserUncheckedCreateWithoutDeletedLocationsInputSchema } from './UserUncheckedCreateWithoutDeletedLocationsInputSchema';

export const UserCreateOrConnectWithoutDeletedLocationsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedLocationsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedLocationsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedLocationsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutDeletedLocationsInputSchema;
