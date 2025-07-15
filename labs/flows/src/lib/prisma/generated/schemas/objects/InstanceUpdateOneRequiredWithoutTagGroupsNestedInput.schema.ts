import { z } from 'zod';
import { InstanceCreateWithoutTagGroupsInputObjectSchema } from './InstanceCreateWithoutTagGroupsInput.schema';
import { InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagGroupsInput.schema';
import { InstanceCreateOrConnectWithoutTagGroupsInputObjectSchema } from './InstanceCreateOrConnectWithoutTagGroupsInput.schema';
import { InstanceUpsertWithoutTagGroupsInputObjectSchema } from './InstanceUpsertWithoutTagGroupsInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceUpdateToOneWithWhereWithoutTagGroupsInputObjectSchema } from './InstanceUpdateToOneWithWhereWithoutTagGroupsInput.schema';
import { InstanceUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUpdateWithoutTagGroupsInput.schema';
import { InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagGroupsInput.schema';

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
    upsert: z
      .lazy(() => InstanceUpsertWithoutTagGroupsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => InstanceWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => InstanceUpdateToOneWithWhereWithoutTagGroupsInputObjectSchema,
        ),
        z.lazy(() => InstanceUpdateWithoutTagGroupsInputObjectSchema),
        z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InstanceUpdateOneRequiredWithoutTagGroupsNestedInputObjectSchema =
  Schema;
