import { z } from 'zod';
import { TagGroupWhereInputObjectSchema } from './objects/TagGroupWhereInput.schema';
import { TagGroupOrderByWithAggregationInputObjectSchema } from './objects/TagGroupOrderByWithAggregationInput.schema';
import { TagGroupScalarWhereWithAggregatesInputObjectSchema } from './objects/TagGroupScalarWhereWithAggregatesInput.schema';
import { TagGroupScalarFieldEnumSchema } from './enums/TagGroupScalarFieldEnum.schema';

export const TagGroupGroupBySchema = z.object({
  where: TagGroupWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      TagGroupOrderByWithAggregationInputObjectSchema,
      TagGroupOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: TagGroupScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(TagGroupScalarFieldEnumSchema),
});
