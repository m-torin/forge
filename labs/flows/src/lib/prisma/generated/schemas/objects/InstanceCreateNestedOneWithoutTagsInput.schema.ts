import { z } from 'zod';
import { InstanceCreateWithoutTagsInputObjectSchema } from './InstanceCreateWithoutTagsInput.schema';
import { InstanceUncheckedCreateWithoutTagsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagsInput.schema';
import { InstanceCreateOrConnectWithoutTagsInputObjectSchema } from './InstanceCreateOrConnectWithoutTagsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InstanceCreateWithoutTagsInputObjectSchema),
        z.lazy(() => InstanceUncheckedCreateWithoutTagsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => InstanceCreateOrConnectWithoutTagsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const InstanceCreateNestedOneWithoutTagsInputObjectSchema = Schema;
