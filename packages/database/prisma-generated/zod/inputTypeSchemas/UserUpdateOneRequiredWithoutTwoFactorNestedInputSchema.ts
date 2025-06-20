import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutTwoFactorInputSchema } from './UserCreateWithoutTwoFactorInputSchema';
import { UserUncheckedCreateWithoutTwoFactorInputSchema } from './UserUncheckedCreateWithoutTwoFactorInputSchema';
import { UserCreateOrConnectWithoutTwoFactorInputSchema } from './UserCreateOrConnectWithoutTwoFactorInputSchema';
import { UserUpsertWithoutTwoFactorInputSchema } from './UserUpsertWithoutTwoFactorInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutTwoFactorInputSchema } from './UserUpdateToOneWithWhereWithoutTwoFactorInputSchema';
import { UserUpdateWithoutTwoFactorInputSchema } from './UserUpdateWithoutTwoFactorInputSchema';
import { UserUncheckedUpdateWithoutTwoFactorInputSchema } from './UserUncheckedUpdateWithoutTwoFactorInputSchema';

export const UserUpdateOneRequiredWithoutTwoFactorNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutTwoFactorNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedCreateWithoutTwoFactorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTwoFactorInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutTwoFactorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutTwoFactorInputSchema),z.lazy(() => UserUpdateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTwoFactorInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutTwoFactorNestedInputSchema;
