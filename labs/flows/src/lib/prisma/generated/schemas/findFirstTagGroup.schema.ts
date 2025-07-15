import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './objects/TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './objects/TagGroupInclude.schema';
import { TagGroupOrderByWithRelationInputObjectSchema } from './objects/TagGroupOrderByWithRelationInput.schema';
import { TagGroupWhereInputObjectSchema } from './objects/TagGroupWhereInput.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './objects/TagGroupWhereUniqueInput.schema';
import { TagGroupScalarFieldEnumSchema } from './enums/TagGroupScalarFieldEnum.schema';

export const TagGroupFindFirstSchema = z.object({
  select: TagGroupSelectObjectSchema.optional(),
  include: TagGroupIncludeObjectSchema.optional(),
  orderBy: z
    .union([
      TagGroupOrderByWithRelationInputObjectSchema,
      TagGroupOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: TagGroupWhereInputObjectSchema.optional(),
  cursor: TagGroupWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(TagGroupScalarFieldEnumSchema).optional(),
});
