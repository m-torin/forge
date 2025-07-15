import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './objects/TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './objects/TagGroupInclude.schema';
import { TagGroupCreateInputObjectSchema } from './objects/TagGroupCreateInput.schema';
import { TagGroupUncheckedCreateInputObjectSchema } from './objects/TagGroupUncheckedCreateInput.schema';

export const TagGroupCreateOneSchema = z.object({
  select: TagGroupSelectObjectSchema.optional(),
  include: TagGroupIncludeObjectSchema.optional(),
  data: z.union([
    TagGroupCreateInputObjectSchema,
    TagGroupUncheckedCreateInputObjectSchema,
  ]),
});
