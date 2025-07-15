import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './objects/InstanceWhereInput.schema';

export const InstanceDeleteManySchema = z.object({
  where: InstanceWhereInputObjectSchema.optional(),
});
