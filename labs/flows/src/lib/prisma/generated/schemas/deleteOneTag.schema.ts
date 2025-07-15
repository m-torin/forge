import { z } from 'zod';
import { TagSelectObjectSchema } from './objects/TagSelect.schema';
import { TagIncludeObjectSchema } from './objects/TagInclude.schema';
import { TagWhereUniqueInputObjectSchema } from './objects/TagWhereUniqueInput.schema';

export const TagDeleteOneSchema = z.object({
  select: TagSelectObjectSchema.optional(),
  include: TagIncludeObjectSchema.optional(),
  where: TagWhereUniqueInputObjectSchema,
});
