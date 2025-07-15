import { z } from 'zod';
import { TestCaseUpdateManyMutationInputObjectSchema } from './objects/TestCaseUpdateManyMutationInput.schema';
import { TestCaseWhereInputObjectSchema } from './objects/TestCaseWhereInput.schema';

export const TestCaseUpdateManySchema = z.object({
  data: TestCaseUpdateManyMutationInputObjectSchema,
  where: TestCaseWhereInputObjectSchema.optional(),
});
