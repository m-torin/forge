import { z } from 'zod';
import { InstanceUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUpdateWithoutTagGroupsInput.schema';
import { InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagGroupsInput.schema';
import { InstanceCreateWithoutTagGroupsInputObjectSchema } from './InstanceCreateWithoutTagGroupsInput.schema';
import { InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagGroupsInput.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => InstanceUpdateWithoutTagGroupsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutTagGroupsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema),
    ]),
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
  })
  .strict();

export const InstanceUpsertWithoutTagGroupsInputObjectSchema = Schema;
