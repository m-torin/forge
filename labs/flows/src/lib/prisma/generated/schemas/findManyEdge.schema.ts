import { z } from 'zod';
import { EdgeSelectObjectSchema } from './objects/EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './objects/EdgeInclude.schema';
import { EdgeOrderByWithRelationInputObjectSchema } from './objects/EdgeOrderByWithRelationInput.schema';
import { EdgeWhereInputObjectSchema } from './objects/EdgeWhereInput.schema';
import { EdgeWhereUniqueInputObjectSchema } from './objects/EdgeWhereUniqueInput.schema';
import { EdgeScalarFieldEnumSchema } from './enums/EdgeScalarFieldEnum.schema';

export const EdgeFindManySchema = z.object({
  select: z.lazy(() => EdgeSelectObjectSchema.optional()),
  include: z.lazy(() => EdgeIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      EdgeOrderByWithRelationInputObjectSchema,
      EdgeOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: EdgeWhereInputObjectSchema.optional(),
  cursor: EdgeWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(EdgeScalarFieldEnumSchema).optional(),
});
