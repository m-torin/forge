import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './objects/TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './objects/TagGroupInclude.schema';
import { TagGroupUpdateInputObjectSchema } from './objects/TagGroupUpdateInput.schema';
import { TagGroupUncheckedUpdateInputObjectSchema } from './objects/TagGroupUncheckedUpdateInput.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './objects/TagGroupWhereUniqueInput.schema';

export const TagGroupUpdateOneSchema = z.object({
  select: TagGroupSelectObjectSchema.optional(),
  include: TagGroupIncludeObjectSchema.optional(),
  data: z.union([
    TagGroupUpdateInputObjectSchema,
    TagGroupUncheckedUpdateInputObjectSchema,
  ]),
  where: TagGroupWhereUniqueInputObjectSchema,
});
