import { z } from 'zod';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';
import { TagGroupUpdateWithoutTagsInputObjectSchema } from './TagGroupUpdateWithoutTagsInput.schema';
import { TagGroupUncheckedUpdateWithoutTagsInputObjectSchema } from './TagGroupUncheckedUpdateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => TagGroupUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupUpdateToOneWithWhereWithoutTagsInputObjectSchema = Schema;
