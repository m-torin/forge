import { z } from 'zod';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { UserUpdateWithoutInstancesInputObjectSchema } from './UserUpdateWithoutInstancesInput.schema';
import { UserUncheckedUpdateWithoutInstancesInputObjectSchema } from './UserUncheckedUpdateWithoutInstancesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => UserUpdateWithoutInstancesInputObjectSchema),
      z.lazy(() => UserUncheckedUpdateWithoutInstancesInputObjectSchema),
    ]),
  })
  .strict();

export const UserUpdateToOneWithWhereWithoutInstancesInputObjectSchema = Schema;
