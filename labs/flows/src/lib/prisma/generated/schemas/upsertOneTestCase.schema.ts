import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './objects/TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './objects/TestCaseInclude.schema';
import { TestCaseWhereUniqueInputObjectSchema } from './objects/TestCaseWhereUniqueInput.schema';
import { TestCaseCreateInputObjectSchema } from './objects/TestCaseCreateInput.schema';
import { TestCaseUncheckedCreateInputObjectSchema } from './objects/TestCaseUncheckedCreateInput.schema';
import { TestCaseUpdateInputObjectSchema } from './objects/TestCaseUpdateInput.schema';
import { TestCaseUncheckedUpdateInputObjectSchema } from './objects/TestCaseUncheckedUpdateInput.schema';

export const TestCaseUpsertSchema = z.object({
  select: TestCaseSelectObjectSchema.optional(),
  include: TestCaseIncludeObjectSchema.optional(),
  where: TestCaseWhereUniqueInputObjectSchema,
  create: z.union([
    TestCaseCreateInputObjectSchema,
    TestCaseUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    TestCaseUpdateInputObjectSchema,
    TestCaseUncheckedUpdateInputObjectSchema,
  ]),
});
