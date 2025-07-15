import { z } from 'zod';
import { TagSelectObjectSchema } from './objects/TagSelect.schema';
import { TagIncludeObjectSchema } from './objects/TagInclude.schema';
import { TagUpdateInputObjectSchema } from './objects/TagUpdateInput.schema';
import { TagUncheckedUpdateInputObjectSchema } from './objects/TagUncheckedUpdateInput.schema';
import { TagWhereUniqueInputObjectSchema } from './objects/TagWhereUniqueInput.schema';

export const TagUpdateOneSchema = z.object({
  select: TagSelectObjectSchema.optional(),
  include: TagIncludeObjectSchema.optional(),
  data: z.union([
    TagUpdateInputObjectSchema,
    TagUncheckedUpdateInputObjectSchema,
  ]),
  where: TagWhereUniqueInputObjectSchema,
});
