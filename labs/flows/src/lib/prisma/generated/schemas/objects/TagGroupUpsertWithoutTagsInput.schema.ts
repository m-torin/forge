import { z } from 'zod';
import { TagGroupUpdateWithoutTagsInputObjectSchema } from './TagGroupUpdateWithoutTagsInput.schema';
import { TagGroupUncheckedUpdateWithoutTagsInputObjectSchema } from './TagGroupUncheckedUpdateWithoutTagsInput.schema';
import { TagGroupCreateWithoutTagsInputObjectSchema } from './TagGroupCreateWithoutTagsInput.schema';
import { TagGroupUncheckedCreateWithoutTagsInputObjectSchema } from './TagGroupUncheckedCreateWithoutTagsInput.schema';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => TagGroupUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagGroupCreateWithoutTagsInputObjectSchema),
      z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
    where: z.lazy(() => TagGroupWhereInputObjectSchema).optional(),
  })
  .strict();

export const TagGroupUpsertWithoutTagsInputObjectSchema = Schema;
