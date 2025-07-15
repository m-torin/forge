import { z } from 'zod';
import { EdgeWhereInputObjectSchema } from './objects/EdgeWhereInput.schema';

export const EdgeDeleteManySchema = z.object({
  where: EdgeWhereInputObjectSchema.optional(),
});
