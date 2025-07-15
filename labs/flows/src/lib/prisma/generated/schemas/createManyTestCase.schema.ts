import { z } from 'zod';
import { TestCaseCreateManyInputObjectSchema } from './objects/TestCaseCreateManyInput.schema';

export const TestCaseCreateManySchema = z.object({
  data: z.union([
    TestCaseCreateManyInputObjectSchema,
    z.array(TestCaseCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
