import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedLocationsInputSchema } from './UserUpdateWithoutDeletedLocationsInputSchema';
import { UserUncheckedUpdateWithoutDeletedLocationsInputSchema } from './UserUncheckedUpdateWithoutDeletedLocationsInputSchema';
import { UserCreateWithoutDeletedLocationsInputSchema } from './UserCreateWithoutDeletedLocationsInputSchema';
import { UserUncheckedCreateWithoutDeletedLocationsInputSchema } from './UserUncheckedCreateWithoutDeletedLocationsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedLocationsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedLocationsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedLocationsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedLocationsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedLocationsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedLocationsInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedLocationsInputSchema;
