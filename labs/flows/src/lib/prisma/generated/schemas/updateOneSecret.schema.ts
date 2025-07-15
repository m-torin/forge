import { z } from 'zod';
import { SecretSelectObjectSchema } from './objects/SecretSelect.schema';
import { SecretIncludeObjectSchema } from './objects/SecretInclude.schema';
import { SecretUpdateInputObjectSchema } from './objects/SecretUpdateInput.schema';
import { SecretUncheckedUpdateInputObjectSchema } from './objects/SecretUncheckedUpdateInput.schema';
import { SecretWhereUniqueInputObjectSchema } from './objects/SecretWhereUniqueInput.schema';

export const SecretUpdateOneSchema = z.object({
  select: SecretSelectObjectSchema.optional(),
  include: SecretIncludeObjectSchema.optional(),
  data: z.union([
    SecretUpdateInputObjectSchema,
    SecretUncheckedUpdateInputObjectSchema,
  ]),
  where: SecretWhereUniqueInputObjectSchema,
});
