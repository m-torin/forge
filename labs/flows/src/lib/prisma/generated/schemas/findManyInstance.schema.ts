import { z } from 'zod';
import { InstanceSelectObjectSchema } from './objects/InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './objects/InstanceInclude.schema';
import { InstanceOrderByWithRelationInputObjectSchema } from './objects/InstanceOrderByWithRelationInput.schema';
import { InstanceWhereInputObjectSchema } from './objects/InstanceWhereInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './objects/InstanceWhereUniqueInput.schema';
import { InstanceScalarFieldEnumSchema } from './enums/InstanceScalarFieldEnum.schema';

export const InstanceFindManySchema = z.object({
  select: z.lazy(() => InstanceSelectObjectSchema.optional()),
  include: z.lazy(() => InstanceIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      InstanceOrderByWithRelationInputObjectSchema,
      InstanceOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: InstanceWhereInputObjectSchema.optional(),
  cursor: InstanceWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(InstanceScalarFieldEnumSchema).optional(),
});
