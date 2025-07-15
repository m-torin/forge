import { z } from 'zod';
import { ScheduledJobOrderByWithRelationInputObjectSchema } from './objects/ScheduledJobOrderByWithRelationInput.schema';
import { ScheduledJobWhereInputObjectSchema } from './objects/ScheduledJobWhereInput.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './objects/ScheduledJobWhereUniqueInput.schema';
import { ScheduledJobCountAggregateInputObjectSchema } from './objects/ScheduledJobCountAggregateInput.schema';
import { ScheduledJobMinAggregateInputObjectSchema } from './objects/ScheduledJobMinAggregateInput.schema';
import { ScheduledJobMaxAggregateInputObjectSchema } from './objects/ScheduledJobMaxAggregateInput.schema';
import { ScheduledJobAvgAggregateInputObjectSchema } from './objects/ScheduledJobAvgAggregateInput.schema';
import { ScheduledJobSumAggregateInputObjectSchema } from './objects/ScheduledJobSumAggregateInput.schema';

export const ScheduledJobAggregateSchema = z.object({
  orderBy: z
    .union([
      ScheduledJobOrderByWithRelationInputObjectSchema,
      ScheduledJobOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: ScheduledJobWhereInputObjectSchema.optional(),
  cursor: ScheduledJobWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), ScheduledJobCountAggregateInputObjectSchema])
    .optional(),
  _min: ScheduledJobMinAggregateInputObjectSchema.optional(),
  _max: ScheduledJobMaxAggregateInputObjectSchema.optional(),
  _avg: ScheduledJobAvgAggregateInputObjectSchema.optional(),
  _sum: ScheduledJobSumAggregateInputObjectSchema.optional(),
});
