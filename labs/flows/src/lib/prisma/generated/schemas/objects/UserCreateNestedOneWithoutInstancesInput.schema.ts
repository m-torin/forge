import { z } from 'zod';
import { UserCreateWithoutInstancesInputObjectSchema } from './UserCreateWithoutInstancesInput.schema';
import { UserUncheckedCreateWithoutInstancesInputObjectSchema } from './UserUncheckedCreateWithoutInstancesInput.schema';
import { UserCreateOrConnectWithoutInstancesInputObjectSchema } from './UserCreateOrConnectWithoutInstancesInput.schema';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => UserCreateWithoutInstancesInputObjectSchema),
        z.lazy(() => UserUncheckedCreateWithoutInstancesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => UserCreateOrConnectWithoutInstancesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => UserWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const UserCreateNestedOneWithoutInstancesInputObjectSchema = Schema;
