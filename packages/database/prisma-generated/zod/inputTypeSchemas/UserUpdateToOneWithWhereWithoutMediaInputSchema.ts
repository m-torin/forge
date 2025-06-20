import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutMediaInputSchema } from './UserUpdateWithoutMediaInputSchema';
import { UserUncheckedUpdateWithoutMediaInputSchema } from './UserUncheckedUpdateWithoutMediaInputSchema';

export const UserUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMediaInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMediaInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMediaInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutMediaInputSchema;
