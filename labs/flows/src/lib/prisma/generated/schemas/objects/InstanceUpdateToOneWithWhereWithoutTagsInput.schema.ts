import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';
import { InstanceUpdateWithoutTagsInputObjectSchema } from './InstanceUpdateWithoutTagsInput.schema';
import { InstanceUncheckedUpdateWithoutTagsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => InstanceUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceUpdateToOneWithWhereWithoutTagsInputObjectSchema = Schema;
