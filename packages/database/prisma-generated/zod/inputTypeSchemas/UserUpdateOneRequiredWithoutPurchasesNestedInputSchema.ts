import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutPurchasesInputSchema } from './UserCreateWithoutPurchasesInputSchema';
import { UserUncheckedCreateWithoutPurchasesInputSchema } from './UserUncheckedCreateWithoutPurchasesInputSchema';
import { UserCreateOrConnectWithoutPurchasesInputSchema } from './UserCreateOrConnectWithoutPurchasesInputSchema';
import { UserUpsertWithoutPurchasesInputSchema } from './UserUpsertWithoutPurchasesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutPurchasesInputSchema } from './UserUpdateToOneWithWhereWithoutPurchasesInputSchema';
import { UserUpdateWithoutPurchasesInputSchema } from './UserUpdateWithoutPurchasesInputSchema';
import { UserUncheckedUpdateWithoutPurchasesInputSchema } from './UserUncheckedUpdateWithoutPurchasesInputSchema';

export const UserUpdateOneRequiredWithoutPurchasesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPurchasesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedCreateWithoutPurchasesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPurchasesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPurchasesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPurchasesInputSchema),z.lazy(() => UserUpdateWithoutPurchasesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPurchasesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutPurchasesNestedInputSchema;
