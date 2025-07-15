import { z } from 'zod';
import { FlowRunOrderByWithRelationInputObjectSchema } from './objects/FlowRunOrderByWithRelationInput.schema';
import { FlowRunWhereInputObjectSchema } from './objects/FlowRunWhereInput.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './objects/FlowRunWhereUniqueInput.schema';
import { FlowRunCountAggregateInputObjectSchema } from './objects/FlowRunCountAggregateInput.schema';
import { FlowRunMinAggregateInputObjectSchema } from './objects/FlowRunMinAggregateInput.schema';
import { FlowRunMaxAggregateInputObjectSchema } from './objects/FlowRunMaxAggregateInput.schema';
import { FlowRunAvgAggregateInputObjectSchema } from './objects/FlowRunAvgAggregateInput.schema';
import { FlowRunSumAggregateInputObjectSchema } from './objects/FlowRunSumAggregateInput.schema';

export const FlowRunAggregateSchema = z.object({
  orderBy: z
    .union([
      FlowRunOrderByWithRelationInputObjectSchema,
      FlowRunOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowRunWhereInputObjectSchema.optional(),
  cursor: FlowRunWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), FlowRunCountAggregateInputObjectSchema])
    .optional(),
  _min: FlowRunMinAggregateInputObjectSchema.optional(),
  _max: FlowRunMaxAggregateInputObjectSchema.optional(),
  _avg: FlowRunAvgAggregateInputObjectSchema.optional(),
  _sum: FlowRunSumAggregateInputObjectSchema.optional(),
});
