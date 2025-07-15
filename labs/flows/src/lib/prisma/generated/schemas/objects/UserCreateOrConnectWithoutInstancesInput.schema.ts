import { z } from 'zod';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';
import { UserCreateWithoutInstancesInputObjectSchema } from './UserCreateWithoutInstancesInput.schema';
import { UserUncheckedCreateWithoutInstancesInputObjectSchema } from './UserUncheckedCreateWithoutInstancesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => UserWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => UserCreateWithoutInstancesInputObjectSchema),
      z.lazy(() => UserUncheckedCreateWithoutInstancesInputObjectSchema),
    ]),
  })
  .strict();

export const UserCreateOrConnectWithoutInstancesInputObjectSchema = Schema;
