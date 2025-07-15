import { z } from 'zod';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupCreateWithoutTagsInputObjectSchema } from './TagGroupCreateWithoutTagsInput.schema';
import { TagGroupUncheckedCreateWithoutTagsInputObjectSchema } from './TagGroupUncheckedCreateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => TagGroupCreateWithoutTagsInputObjectSchema),
      z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupCreateOrConnectWithoutTagsInputObjectSchema = Schema;
