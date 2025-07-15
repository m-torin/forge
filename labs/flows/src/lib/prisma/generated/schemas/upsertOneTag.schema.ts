import { z } from 'zod';
import { TagSelectObjectSchema } from './objects/TagSelect.schema';
import { TagIncludeObjectSchema } from './objects/TagInclude.schema';
import { TagWhereUniqueInputObjectSchema } from './objects/TagWhereUniqueInput.schema';
import { TagCreateInputObjectSchema } from './objects/TagCreateInput.schema';
import { TagUncheckedCreateInputObjectSchema } from './objects/TagUncheckedCreateInput.schema';
import { TagUpdateInputObjectSchema } from './objects/TagUpdateInput.schema';
import { TagUncheckedUpdateInputObjectSchema } from './objects/TagUncheckedUpdateInput.schema';

export const TagUpsertSchema = z.object({
  select: TagSelectObjectSchema.optional(),
  include: TagIncludeObjectSchema.optional(),
  where: TagWhereUniqueInputObjectSchema,
  create: z.union([
    TagCreateInputObjectSchema,
    TagUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    TagUpdateInputObjectSchema,
    TagUncheckedUpdateInputObjectSchema,
  ]),
});
