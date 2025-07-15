import { z } from 'zod';
import { InstanceUpdateWithoutTagsInputObjectSchema } from './InstanceUpdateWithoutTagsInput.schema';
import { InstanceUncheckedUpdateWithoutTagsInputObjectSchema } from './InstanceUncheckedUpdateWithoutTagsInput.schema';
import { InstanceCreateWithoutTagsInputObjectSchema } from './InstanceCreateWithoutTagsInput.schema';
import { InstanceUncheckedCreateWithoutTagsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagsInput.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => InstanceUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutTagsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
  })
  .strict();

export const InstanceUpsertWithoutTagsInputObjectSchema = Schema;
