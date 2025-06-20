import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutApiKeysInputSchema } from './UserCreateWithoutApiKeysInputSchema';
import { UserUncheckedCreateWithoutApiKeysInputSchema } from './UserUncheckedCreateWithoutApiKeysInputSchema';
import { UserCreateOrConnectWithoutApiKeysInputSchema } from './UserCreateOrConnectWithoutApiKeysInputSchema';
import { UserUpsertWithoutApiKeysInputSchema } from './UserUpsertWithoutApiKeysInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutApiKeysInputSchema } from './UserUpdateToOneWithWhereWithoutApiKeysInputSchema';
import { UserUpdateWithoutApiKeysInputSchema } from './UserUpdateWithoutApiKeysInputSchema';
import { UserUncheckedUpdateWithoutApiKeysInputSchema } from './UserUncheckedUpdateWithoutApiKeysInputSchema';

export const UserUpdateOneRequiredWithoutApiKeysNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutApiKeysNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutApiKeysInputSchema),z.lazy(() => UserUncheckedCreateWithoutApiKeysInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutApiKeysInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutApiKeysInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutApiKeysInputSchema),z.lazy(() => UserUpdateWithoutApiKeysInputSchema),z.lazy(() => UserUncheckedUpdateWithoutApiKeysInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneRequiredWithoutApiKeysNestedInputSchema;
