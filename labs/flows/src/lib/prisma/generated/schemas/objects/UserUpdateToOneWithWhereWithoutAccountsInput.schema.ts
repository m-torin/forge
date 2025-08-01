import { z } from 'zod';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { UserUpdateWithoutAccountsInputObjectSchema } from './UserUpdateWithoutAccountsInput.schema';
import { UserUncheckedUpdateWithoutAccountsInputObjectSchema } from './UserUncheckedUpdateWithoutAccountsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutAccountsInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutAccountsInputObjectSchema),
    ]),
  })
  .strict();

export const UserUpdateToOneWithWhereWithoutAccountsInputObjectSchema = Schema;
