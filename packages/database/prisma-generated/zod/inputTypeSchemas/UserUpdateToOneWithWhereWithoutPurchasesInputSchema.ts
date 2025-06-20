import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutPurchasesInputSchema } from './UserUpdateWithoutPurchasesInputSchema';
import { UserUncheckedUpdateWithoutPurchasesInputSchema } from './UserUncheckedUpdateWithoutPurchasesInputSchema';

export const UserUpdateToOneWithWhereWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPurchasesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutPurchasesInputSchema;
