import { z } from 'zod';
import { TestCaseWhereInputObjectSchema } from './objects/TestCaseWhereInput.schema';
import { TestCaseOrderByWithAggregationInputObjectSchema } from './objects/TestCaseOrderByWithAggregationInput.schema';
import { TestCaseScalarWhereWithAggregatesInputObjectSchema } from './objects/TestCaseScalarWhereWithAggregatesInput.schema';
import { TestCaseScalarFieldEnumSchema } from './enums/TestCaseScalarFieldEnum.schema';

export const TestCaseGroupBySchema = z.object({
  where: TestCaseWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      TestCaseOrderByWithAggregationInputObjectSchema,
      TestCaseOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: TestCaseScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(TestCaseScalarFieldEnumSchema),
});
