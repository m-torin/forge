import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';
import { InstanceUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUpdateWithoutTagGroupsInput.schema';
import { InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagGroupsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => InstanceUpdateWithoutTagGroupsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutTagGroupsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceUpdateToOneWithWhereWithoutTagGroupsInputObjectSchema =
  Schema;
