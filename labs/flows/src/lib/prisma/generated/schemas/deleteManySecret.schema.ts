import { z } from 'zod';
import { SecretWhereInputObjectSchema } from './objects/SecretWhereInput.schema';

export const SecretDeleteManySchema = z.object({
  where: SecretWhereInputObjectSchema.optional(),
});
