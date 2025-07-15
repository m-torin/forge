import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './objects/TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './objects/TestCaseInclude.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './objects/TestCaseWhereUniqueInput.schema';

export const TestCaseDeleteOneSchema = z.object({
  select: TestCaseSelectObjectSchema.optional(),
  include: TestCaseIncludeObjectSchema.optional(),
  where: TestCaseWhereUniqueInputObjectSchema,
});
