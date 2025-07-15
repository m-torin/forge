import { z } from 'zod';
import { TestCaseWhereInputObjectSchema } from './objects/TestCaseWhereInput.schema';

export const TestCaseDeleteManySchema = z.object({
  where: TestCaseWhereInputObjectSchema.optional(),
});
