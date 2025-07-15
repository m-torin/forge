import { z } from 'zod';
import { UserUpdateWithoutInstancesInputObjectSchema } from './UserUpdateWithoutInstancesInput.schema';
import { UserUncheckedUpdateWithoutInstancesInputObjectSchema } from './UserUncheckedUpdateWithoutInstancesInput.schema';
import { UserCreateWithoutInstancesInputObjectSchema } from './UserCreateWithoutInstancesInput.schema';
import { UserUncheckedCreateWithoutInstancesInputObjectSchema } from './UserUncheckedCreateWithoutInstancesInput.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => UserUpdateWithoutInstancesInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutInstancesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutInstancesInputObjectSchema),
      z.lazy(() => UserUncheckedCreateWithoutInstancesInputObjectSchema),
    ]),
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
  })
  .strict();

export const UserUpsertWithoutInstancesInputObjectSchema = Schema;
