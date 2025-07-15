import { z } from 'zod';
import { NodeSelectObjectSchema } from './objects/NodeSelect.schema';
import { NodeIncludeObjectSchema } from './objects/NodeInclude.schema';
import { NodeOrderByWithRelationInputObjectSchema } from './objects/NodeOrderByWithRelationInput.schema';
import { NodeWhereInputObjectSchema } from './objects/NodeWhereInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './objects/NodeWhereUniqueInput.schema';
import { NodeScalarFieldEnumSchema } from './enums/NodeScalarFieldEnum.schema';

export const NodeFindManySchema = z.object({
  select: z.lazy(() => NodeSelectObjectSchema.optional()),
  include: z.lazy(() => NodeIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      NodeOrderByWithRelationInputObjectSchema,
      NodeOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: NodeWhereInputObjectSchema.optional(),
  cursor: NodeWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(NodeScalarFieldEnumSchema).optional(),
});
