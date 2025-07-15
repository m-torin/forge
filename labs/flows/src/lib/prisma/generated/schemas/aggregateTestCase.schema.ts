import { z } from 'zod';
import { TestCaseOrderByWithRelationInputObjectSchema } from './objects/TestCaseOrderByWithRelationInput.schema';
import { TestCaseWhereInputObjectSchema } from './objects/TestCaseWhereInput.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './objects/TestCaseWhereUniqueInput.schema';
import { TestCaseCountAggregateInputObjectSchema } from './objects/TestCaseCountAggregateInput.schema';
import { TestCaseMinAggregateInputObjectSchema } from './objects/TestCaseMinAggregateInput.schema';
import { TestCaseMaxAggregateInputObjectSchema } from './objects/TestCaseMaxAggregateInput.schema';

export const TestCaseAggregateSchema = z.object({
  orderBy: z
    .union([
      TestCaseOrderByWithRelationInputObjectSchema,
      TestCaseOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: TestCaseWhereInputObjectSchema.optional(),
  cursor: TestCaseWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), TestCaseCountAggregateInputObjectSchema])
    .optional(),
  _min: TestCaseMinAggregateInputObjectSchema.optional(),
  _max: TestCaseMaxAggregateInputObjectSchema.optional(),
});
