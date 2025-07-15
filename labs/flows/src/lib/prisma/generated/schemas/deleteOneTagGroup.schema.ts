import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './objects/TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './objects/TagGroupInclude.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './objects/TagGroupWhereUniqueInput.schema';

export const TagGroupDeleteOneSchema = z.object({
  select: TagGroupSelectObjectSchema.optional(),
  include: TagGroupIncludeObjectSchema.optional(),
  where: TagGroupWhereUniqueInputObjectSchema,
});
