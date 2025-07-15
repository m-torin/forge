import { z } from 'zod';
import { TagSelectObjectSchema } from './objects/TagSelect.schema';
import { TagIncludeObjectSchema } from './objects/TagInclude.schema';
import { TagCreateInputObjectSchema } from './objects/TagCreateInput.schema';
import { TagUncheckedCreateInputObjectSchema } from './objects/TagUncheckedCreateInput.schema';

export const TagCreateOneSchema = z.object({
  select: TagSelectObjectSchema.optional(),
  include: TagIncludeObjectSchema.optional(),
  data: z.union([
    TagCreateInputObjectSchema,
    TagUncheckedCreateInputObjectSchema,
  ]),
});
