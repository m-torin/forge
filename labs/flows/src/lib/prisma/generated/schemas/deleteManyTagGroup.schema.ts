import { z } from 'zod';
import { TagGroupWhereInputObjectSchema } from './objects/TagGroupWhereInput.schema';

export const TagGroupDeleteManySchema = z.object({
  where: TagGroupWhereInputObjectSchema.optional(),
});
