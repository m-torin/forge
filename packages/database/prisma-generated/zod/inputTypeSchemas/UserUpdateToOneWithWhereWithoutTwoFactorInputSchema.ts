import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutTwoFactorInputSchema } from './UserUpdateWithoutTwoFactorInputSchema';
import { UserUncheckedUpdateWithoutTwoFactorInputSchema } from './UserUncheckedUpdateWithoutTwoFactorInputSchema';

export const UserUpdateToOneWithWhereWithoutTwoFactorInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTwoFactorInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTwoFactorInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutTwoFactorInputSchema;
