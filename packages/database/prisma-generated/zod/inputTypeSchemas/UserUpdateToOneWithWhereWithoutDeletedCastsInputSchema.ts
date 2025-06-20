import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedCastsInputSchema } from './UserUpdateWithoutDeletedCastsInputSchema';
import { UserUncheckedUpdateWithoutDeletedCastsInputSchema } from './UserUncheckedUpdateWithoutDeletedCastsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedCastsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedCastsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDeletedCastsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedCastsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutDeletedCastsInputSchema;
