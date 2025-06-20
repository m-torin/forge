import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutPurchasesInputSchema } from './UserUpdateWithoutPurchasesInputSchema';
import { UserUncheckedUpdateWithoutPurchasesInputSchema } from './UserUncheckedUpdateWithoutPurchasesInputSchema';
import { UserCreateWithoutPurchasesInputSchema } from './UserCreateWithoutPurchasesInputSchema';
import { UserUncheckedCreateWithoutPurchasesInputSchema } from './UserUncheckedCreateWithoutPurchasesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutPurchasesInputSchema: z.ZodType<Prisma.UserUpsertWithoutPurchasesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutPurchasesInputSchema;
