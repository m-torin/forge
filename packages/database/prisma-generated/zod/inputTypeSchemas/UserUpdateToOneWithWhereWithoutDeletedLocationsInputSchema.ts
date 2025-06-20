import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedLocationsInputSchema } from './UserUpdateWithoutDeletedLocationsInputSchema';
import { UserUncheckedUpdateWithoutDeletedLocationsInputSchema } from './UserUncheckedUpdateWithoutDeletedLocationsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedLocationsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedLocationsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDeletedLocationsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedLocationsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutDeletedLocationsInputSchema;
