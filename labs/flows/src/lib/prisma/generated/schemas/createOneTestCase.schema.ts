import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './objects/TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './objects/TestCaseInclude.schema';
import { TestCaseCreateInputObjectSchema } from './objects/TestCaseCreateInput.schema';
import { TestCaseUncheckedCreateInputObjectSchema } from './objects/TestCaseUncheckedCreateInput.schema';

export const TestCaseCreateOneSchema = z.object({
  select: TestCaseSelectObjectSchema.optional(),
  include: TestCaseIncludeObjectSchema.optional(),
  data: z.union([
    TestCaseCreateInputObjectSchema,
    TestCaseUncheckedCreateInputObjectSchema,
  ]),
});
