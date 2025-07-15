import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './objects/FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './objects/FlowStatisticsInclude.schema';
import { FlowStatisticsOrderByWithRelationInputObjectSchema } from './objects/FlowStatisticsOrderByWithRelationInput.schema';
import { FlowStatisticsWhereInputObjectSchema } from './objects/FlowStatisticsWhereInput.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './objects/FlowStatisticsWhereUniqueInput.schema';
import { FlowStatisticsScalarFieldEnumSchema } from './enums/FlowStatisticsScalarFieldEnum.schema';

export const FlowStatisticsFindFirstSchema = z.object({
  select: FlowStatisticsSelectObjectSchema.optional(),
  include: FlowStatisticsIncludeObjectSchema.optional(),
  orderBy: z
    .union([
      FlowStatisticsOrderByWithRelationInputObjectSchema,
      FlowStatisticsOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowStatisticsWhereInputObjectSchema.optional(),
  cursor: FlowStatisticsWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(FlowStatisticsScalarFieldEnumSchema).optional(),
});
