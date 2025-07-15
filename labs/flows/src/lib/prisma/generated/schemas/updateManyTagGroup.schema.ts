import { z } from 'zod';
import { TagGroupUpdateManyMutationInputObjectSchema } from './objects/TagGroupUpdateManyMutationInput.schema';
import { TagGroupWhereInputObjectSchema } from './objects/TagGroupWhereInput.schema';

export const TagGroupUpdateManySchema = z.object({
  data: TagGroupUpdateManyMutationInputObjectSchema,
  where: TagGroupWhereInputObjectSchema.optional(),
});
