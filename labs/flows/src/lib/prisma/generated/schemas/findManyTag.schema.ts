import { z } from 'zod';
import { TagSelectObjectSchema } from './objects/TagSelect.schema';
import { TagIncludeObjectSchema } from './objects/TagInclude.schema';
import { TagOrderByWithRelationInputObjectSchema } from './objects/TagOrderByWithRelationInput.schema';
import { TagWhereInputObjectSchema } from './objects/TagWhereInput.schema';
import { TagWhereUniqueInputObjectSchema } from './objects/TagWhereUniqueInput.schema';
import { TagScalarFieldEnumSchema } from './enums/TagScalarFieldEnum.schema';

export const TagFindManySchema = z.object({
  select: z.lazy(() => TagSelectObjectSchema.optional()),
  include: z.lazy(() => TagIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      TagOrderByWithRelationInputObjectSchema,
      TagOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: TagWhereInputObjectSchema.optional(),
  cursor: TagWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(TagScalarFieldEnumSchema).optional(),
});
