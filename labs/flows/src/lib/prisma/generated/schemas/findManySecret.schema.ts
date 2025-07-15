import { z } from 'zod';
import { SecretSelectObjectSchema } from './objects/SecretSelect.schema';
import { SecretIncludeObjectSchema } from './objects/SecretInclude.schema';
import { SecretOrderByWithRelationInputObjectSchema } from './objects/SecretOrderByWithRelationInput.schema';
import { SecretWhereInputObjectSchema } from './objects/SecretWhereInput.schema';
import { SecretWhereUniqueInputObjectSchema } from './objects/SecretWhereUniqueInput.schema';
import { SecretScalarFieldEnumSchema } from './enums/SecretScalarFieldEnum.schema';

export const SecretFindManySchema = z.object({
  select: z.lazy(() => SecretSelectObjectSchema.optional()),
  include: z.lazy(() => SecretIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      SecretOrderByWithRelationInputObjectSchema,
      SecretOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: SecretWhereInputObjectSchema.optional(),
  cursor: SecretWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(SecretScalarFieldEnumSchema).optional(),
});
