import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './objects/TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './objects/TestCaseInclude.schema';
import { TestCaseOrderByWithRelationInputObjectSchema } from './objects/TestCaseOrderByWithRelationInput.schema';
import { TestCaseWhereInputObjectSchema } from './objects/TestCaseWhereInput.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './objects/TestCaseWhereUniqueInput.schema';
import { TestCaseScalarFieldEnumSchema } from './enums/TestCaseScalarFieldEnum.schema';

export const TestCaseFindFirstSchema = z.object({
  select: TestCaseSelectObjectSchema.optional(),
  include: TestCaseIncludeObjectSchema.optional(),
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
  distinct: z.array(TestCaseScalarFieldEnumSchema).optional(),
});
