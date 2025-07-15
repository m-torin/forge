import { z } from 'zod';
import { SecretSelectObjectSchema } from './objects/SecretSelect.schema';
import { SecretIncludeObjectSchema } from './objects/SecretInclude.schema';
import { SecretWhereUniqueInputObjectSchema } from './objects/SecretWhereUniqueInput.schema';

export const SecretDeleteOneSchema = z.object({
  select: SecretSelectObjectSchema.optional(),
  include: SecretIncludeObjectSchema.optional(),
  where: SecretWhereUniqueInputObjectSchema,
});
