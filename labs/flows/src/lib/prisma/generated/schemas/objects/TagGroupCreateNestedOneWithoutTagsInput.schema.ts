import { z } from 'zod';
import { TagGroupCreateWithoutTagsInputObjectSchema } from './TagGroupCreateWithoutTagsInput.schema';
import { TagGroupUncheckedCreateWithoutTagsInputObjectSchema } from './TagGroupUncheckedCreateWithoutTagsInput.schema';
import { TagGroupCreateOrConnectWithoutTagsInputObjectSchema } from './TagGroupCreateOrConnectWithoutTagsInput.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagGroupCreateWithoutTagsInputObjectSchema),
        z.lazy(() => TagGroupUncheckedCreateWithoutTagsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => TagGroupCreateOrConnectWithoutTagsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => TagGroupWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const TagGroupCreateNestedOneWithoutTagsInputObjectSchema = Schema;
