import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './objects/InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './objects/InfrastructureInclude.schema';
import { InfrastructureOrderByWithRelationInputObjectSchema } from './objects/InfrastructureOrderByWithRelationInput.schema';
import { InfrastructureWhereInputObjectSchema } from './objects/InfrastructureWhereInput.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './objects/InfrastructureWhereUniqueInput.schema';
import { InfrastructureScalarFieldEnumSchema } from './enums/InfrastructureScalarFieldEnum.schema';

export const InfrastructureFindFirstSchema = z.object({
  select: InfrastructureSelectObjectSchema.optional(),
  include: InfrastructureIncludeObjectSchema.optional(),
  orderBy: z
    .union([
      InfrastructureOrderByWithRelationInputObjectSchema,
      InfrastructureOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: InfrastructureWhereInputObjectSchema.optional(),
  cursor: InfrastructureWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(InfrastructureScalarFieldEnumSchema).optional(),
});
