import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutOrdersInputSchema } from './UserUpdateWithoutOrdersInputSchema';
import { UserUncheckedUpdateWithoutOrdersInputSchema } from './UserUncheckedUpdateWithoutOrdersInputSchema';

export const UserUpdateToOneWithWhereWithoutOrdersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutOrdersInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutOrdersInputSchema),z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutOrdersInputSchema;
