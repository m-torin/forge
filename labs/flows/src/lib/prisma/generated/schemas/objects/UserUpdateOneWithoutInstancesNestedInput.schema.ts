import { z } from 'zod';
import { UserCreateWithoutInstancesInputObjectSchema } from './UserCreateWithoutInstancesInput.schema';
import { UserUncheckedCreateWithoutInstancesInputObjectSchema } from './UserUncheckedCreateWithoutInstancesInput.schema';
import { UserCreateOrConnectWithoutInstancesInputObjectSchema } from './UserCreateOrConnectWithoutInstancesInput.schema';
import { UserUpsertWithoutInstancesInputObjectSchema } from './UserUpsertWithoutInstancesInput.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { UserWhereUniqueInputObjectSchema } from './UserWhereUniqueInput.schema';
import { UserUpdateToOneWithWhereWithoutInstancesInputObjectSchema } from './UserUpdateToOneWithWhereWithoutInstancesInput.schema';
import { UserUpdateWithoutInstancesInputObjectSchema } from './UserUpdateWithoutInstancesInput.schema';
import { UserUncheckedUpdateWithoutInstancesInputObjectSchema } from './UserUncheckedUpdateWithoutInstancesInput.schema';

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
    upsert: z
      .lazy(() => UserUpsertWithoutInstancesInputObjectSchema)
      .optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => UserWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => UserWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => UserWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => UserUpdateToOneWithWhereWithoutInstancesInputObjectSchema),
        z.lazy(() => UserUpdateWithoutInstancesInputObjectSchema),
        z.lazy(() => UserUncheckedUpdateWithoutInstancesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const UserUpdateOneWithoutInstancesNestedInputObjectSchema = Schema;
