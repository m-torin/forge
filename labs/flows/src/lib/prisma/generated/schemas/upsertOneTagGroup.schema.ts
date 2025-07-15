import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './objects/TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './objects/TagGroupInclude.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './objects/TagGroupWhereUniqueInput.schema';
import { TagGroupCreateInputObjectSchema } from './objects/TagGroupCreateInput.schema';
import { TagGroupUncheckedCreateInputObjectSchema } from './objects/TagGroupUncheckedCreateInput.schema';
import { TagGroupUpdateInputObjectSchema } from './objects/TagGroupUpdateInput.schema';
import { TagGroupUncheckedUpdateInputObjectSchema } from './objects/TagGroupUncheckedUpdateInput.schema';

export const TagGroupUpsertSchema = z.object({
  select: TagGroupSelectObjectSchema.optional(),
  include: TagGroupIncludeObjectSchema.optional(),
  where: TagGroupWhereUniqueInputObjectSchema,
  create: z.union([
    TagGroupCreateInputObjectSchema,
    TagGroupUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    TagGroupUpdateInputObjectSchema,
    TagGroupUncheckedUpdateInputObjectSchema,
  ]),
});
