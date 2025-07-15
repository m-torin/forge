import { z } from 'zod';
import { UserUpdateWithoutSessionsInputObjectSchema } from './UserUpdateWithoutSessionsInput.schema';
import { UserUncheckedUpdateWithoutSessionsInputObjectSchema } from './UserUncheckedUpdateWithoutSessionsInput.schema';
import { UserCreateWithoutSessionsInputObjectSchema } from './UserCreateWithoutSessionsInput.schema';
import { UserUncheckedCreateWithoutSessionsInputObjectSchema } from './UserUncheckedCreateWithoutSessionsInput.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => UserUpdateWithoutSessionsInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutSessionsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => UserCreateWithoutSessionsInputObjectSchema),
      z.lazy(() => UserUncheckedCreateWithoutSessionsInputObjectSchema),
    ]),
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
  })
  .strict();

export const UserUpsertWithoutSessionsInputObjectSchema = Schema;
