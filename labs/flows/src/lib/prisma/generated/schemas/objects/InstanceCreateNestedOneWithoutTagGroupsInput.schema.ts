import { z } from 'zod';
import { InstanceCreateWithoutTagGroupsInputObjectSchema } from './InstanceCreateWithoutTagGroupsInput.schema';
import { InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagGroupsInput.schema';
import { InstanceCreateOrConnectWithoutTagGroupsInputObjectSchema } from './InstanceCreateOrConnectWithoutTagGroupsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InstanceCreateWithoutTagGroupsInputObjectSchema),
        z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => InstanceCreateOrConnectWithoutTagGroupsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const InstanceCreateNestedOneWithoutTagGroupsInputObjectSchema = Schema;
