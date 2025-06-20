import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedRegistriesInputSchema } from './UserUpdateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedRegistriesInputSchema } from './UserUncheckedUpdateWithoutDeletedRegistriesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedRegistriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedRegistriesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedRegistriesInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutDeletedRegistriesInputSchema;
