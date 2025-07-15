import { z } from 'zod';
import { TagGroupOrderByWithRelationInputObjectSchema } from './objects/TagGroupOrderByWithRelationInput.schema';
import { TagGroupWhereInputObjectSchema } from './objects/TagGroupWhereInput.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './objects/TagGroupWhereUniqueInput.schema';
import { TagGroupCountAggregateInputObjectSchema } from './objects/TagGroupCountAggregateInput.schema';
import { TagGroupMinAggregateInputObjectSchema } from './objects/TagGroupMinAggregateInput.schema';
import { TagGroupMaxAggregateInputObjectSchema } from './objects/TagGroupMaxAggregateInput.schema';

export const TagGroupAggregateSchema = z.object({
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
  _count: z
    .union([z.literal(true), TagGroupCountAggregateInputObjectSchema])
    .optional(),
  _min: TagGroupMinAggregateInputObjectSchema.optional(),
  _max: TagGroupMaxAggregateInputObjectSchema.optional(),
});
