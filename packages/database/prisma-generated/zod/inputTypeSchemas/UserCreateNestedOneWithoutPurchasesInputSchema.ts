import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutPurchasesInputSchema } from './UserCreateWithoutPurchasesInputSchema';
import { UserUncheckedCreateWithoutPurchasesInputSchema } from './UserUncheckedCreateWithoutPurchasesInputSchema';
import { UserCreateOrConnectWithoutPurchasesInputSchema } from './UserCreateOrConnectWithoutPurchasesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutPurchasesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPurchasesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPurchasesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutPurchasesInputSchema;
