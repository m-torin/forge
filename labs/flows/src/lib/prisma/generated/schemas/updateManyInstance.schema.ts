import { z } from 'zod';
import { InstanceUpdateManyMutationInputObjectSchema } from './objects/InstanceUpdateManyMutationInput.schema';
import { InstanceWhereInputObjectSchema } from './objects/InstanceWhereInput.schema';

export const InstanceUpdateManySchema = z.object({
  data: InstanceUpdateManyMutationInputObjectSchema,
  where: InstanceWhereInputObjectSchema.optional(),
});
