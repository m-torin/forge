import { z } from 'zod';
import { ScheduledJobWhereInputObjectSchema } from './objects/ScheduledJobWhereInput.schema';
import { ScheduledJobOrderByWithAggregationInputObjectSchema } from './objects/ScheduledJobOrderByWithAggregationInput.schema';
import { ScheduledJobScalarWhereWithAggregatesInputObjectSchema } from './objects/ScheduledJobScalarWhereWithAggregatesInput.schema';
import { ScheduledJobScalarFieldEnumSchema } from './enums/ScheduledJobScalarFieldEnum.schema';

export const ScheduledJobGroupBySchema = z.object({
  where: ScheduledJobWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      ScheduledJobOrderByWithAggregationInputObjectSchema,
      ScheduledJobOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: ScheduledJobScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(ScheduledJobScalarFieldEnumSchema),
});
