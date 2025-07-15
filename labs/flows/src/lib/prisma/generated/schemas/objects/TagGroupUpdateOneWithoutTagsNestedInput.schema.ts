import { z } from 'zod';
import { TagGroupCreateWithoutTagsInputObjectSchema } from './TagGroupCreateWithoutTagsInput.schema';
import { TagGroupUncheckedCreateWithoutTagsInputObjectSchema } from './TagGroupUncheckedCreateWithoutTagsInput.schema';
import { TagGroupCreateOrConnectWithoutTagsInputObjectSchema } from './TagGroupCreateOrConnectWithoutTagsInput.schema';
import { TagGroupUpsertWithoutTagsInputObjectSchema } from './TagGroupUpsertWithoutTagsInput.schema';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupUpdateToOneWithWhereWithoutTagsInputObjectSchema } from './TagGroupUpdateToOneWithWhereWithoutTagsInput.schema';
import { TagGroupUpdateWithoutTagsInputObjectSchema } from './TagGroupUpdateWithoutTagsInput.schema';
import { TagGroupUncheckedUpdateWithoutTagsInputObjectSchema } from './TagGroupUncheckedUpdateWithoutTagsInput.schema';

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
    upsert: z.lazy(() => TagGroupUpsertWithoutTagsInputObjectSchema).optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => TagGroupWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => TagGroupWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => TagGroupWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => TagGroupUpdateToOneWithWhereWithoutTagsInputObjectSchema),
        z.lazy(() => TagGroupUpdateWithoutTagsInputObjectSchema),
        z.lazy(() => TagGroupUncheckedUpdateWithoutTagsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TagGroupUpdateOneWithoutTagsNestedInputObjectSchema = Schema;
