import { z } from 'zod';
import { SecretCreateManyInputObjectSchema } from './objects/SecretCreateManyInput.schema';

export const SecretCreateManySchema = z.object({
  data: z.union([
    SecretCreateManyInputObjectSchema,
    z.array(SecretCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
