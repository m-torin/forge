import { z } from 'zod';
import { SecretSelectObjectSchema } from './objects/SecretSelect.schema';
import { SecretIncludeObjectSchema } from './objects/SecretInclude.schema';
import { SecretWhereUniqueInputObjectSchema } from './objects/SecretWhereUniqueInput.schema';
import { SecretCreateInputObjectSchema } from './objects/SecretCreateInput.schema';
import { SecretUncheckedCreateInputObjectSchema } from './objects/SecretUncheckedCreateInput.schema';
import { SecretUpdateInputObjectSchema } from './objects/SecretUpdateInput.schema';
import { SecretUncheckedUpdateInputObjectSchema } from './objects/SecretUncheckedUpdateInput.schema';

export const SecretUpsertSchema = z.object({
  select: SecretSelectObjectSchema.optional(),
  include: SecretIncludeObjectSchema.optional(),
  where: SecretWhereUniqueInputObjectSchema,
  create: z.union([
    SecretCreateInputObjectSchema,
    SecretUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    SecretUpdateInputObjectSchema,
    SecretUncheckedUpdateInputObjectSchema,
  ]),
});
