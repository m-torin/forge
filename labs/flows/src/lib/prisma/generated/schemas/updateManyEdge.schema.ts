import { z } from 'zod';
import { EdgeUpdateManyMutationInputObjectSchema } from './objects/EdgeUpdateManyMutationInput.schema';
import { EdgeWhereInputObjectSchema } from './objects/EdgeWhereInput.schema';

export const EdgeUpdateManySchema = z.object({
  data: EdgeUpdateManyMutationInputObjectSchema,
  where: EdgeWhereInputObjectSchema.optional(),
});
