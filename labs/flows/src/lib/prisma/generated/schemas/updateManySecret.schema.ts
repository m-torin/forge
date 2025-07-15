import { z } from 'zod';
import { SecretUpdateManyMutationInputObjectSchema } from './objects/SecretUpdateManyMutationInput.schema';
import { SecretWhereInputObjectSchema } from './objects/SecretWhereInput.schema';

export const SecretUpdateManySchema = z.object({
  data: SecretUpdateManyMutationInputObjectSchema,
  where: SecretWhereInputObjectSchema.optional(),
});
