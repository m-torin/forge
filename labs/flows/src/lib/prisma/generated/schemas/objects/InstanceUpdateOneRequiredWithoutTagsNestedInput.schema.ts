import { z } from 'zod';
import { InstanceCreateWithoutTagsInputObjectSchema } from './InstanceCreateWithoutTagsInput.schema';
import { InstanceUncheckedCreateWithoutTagsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagsInput.schema';
import { InstanceCreateOrConnectWithoutTagsInputObjectSchema } from './InstanceCreateOrConnectWithoutTagsInput.schema';
import { InstanceUpsertWithoutTagsInputObjectSchema } from './InstanceUpsertWithoutTagsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceUpdateToOneWithWhereWithoutTagsInputObjectSchema } from './InstanceUpdateToOneWithWhereWithoutTagsInput.schema';
import { InstanceUpdateWithoutTagsInputObjectSchema } from './InstanceUpdateWithoutTagsInput.schema';
import { InstanceUncheckedUpdateWithoutTagsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagsInput.schema';

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
    upsert: z.lazy(() => InstanceUpsertWithoutTagsInputObjectSchema).optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => InstanceUpdateToOneWithWhereWithoutTagsInputObjectSchema),
        z.lazy(() => InstanceUpdateWithoutTagsInputObjectSchema),
        z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InstanceUpdateOneRequiredWithoutTagsNestedInputObjectSchema =
  Schema;
