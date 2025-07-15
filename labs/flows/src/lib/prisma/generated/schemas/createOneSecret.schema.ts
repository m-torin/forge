import { z } from 'zod';
import { SecretSelectObjectSchema } from './objects/SecretSelect.schema';
import { SecretIncludeObjectSchema } from './objects/SecretInclude.schema';
import { SecretCreateInputObjectSchema } from './objects/SecretCreateInput.schema';
import { SecretUncheckedCreateInputObjectSchema } from './objects/SecretUncheckedCreateInput.schema';

export const SecretCreateOneSchema = z.object({
  select: SecretSelectObjectSchema.optional(),
  include: SecretIncludeObjectSchema.optional(),
  data: z.union([
    SecretCreateInputObjectSchema,
    SecretUncheckedCreateInputObjectSchema,
  ]),
});
