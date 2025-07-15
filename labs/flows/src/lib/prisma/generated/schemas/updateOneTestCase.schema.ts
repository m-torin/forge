import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './objects/TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './objects/TestCaseInclude.schema';
import { TestCaseUpdateInputObjectSchema } from './objects/TestCaseUpdateInput.schema';
import { TestCaseUncheckedUpdateInputObjectSchema } from './objects/TestCaseUncheckedUpdateInput.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './objects/TestCaseWhereUniqueInput.schema';

export const TestCaseUpdateOneSchema = z.object({
  select: TestCaseSelectObjectSchema.optional(),
  include: TestCaseIncludeObjectSchema.optional(),
  data: z.union([
    TestCaseUpdateInputObjectSchema,
    TestCaseUncheckedUpdateInputObjectSchema,
  ]),
  where: TestCaseWhereUniqueInputObjectSchema,
});
