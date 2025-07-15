import { z } from 'zod';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { UserUpdateWithoutSessionsInputObjectSchema } from './UserUpdateWithoutSessionsInput.schema';
import { UserUncheckedUpdateWithoutSessionsInputObjectSchema } from './UserUncheckedUpdateWithoutSessionsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutSessionsInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutSessionsInputObjectSchema),
    ]),
  })
  .strict();

export const UserUpdateToOneWithWhereWithoutSessionsInputObjectSchema = Schema;
