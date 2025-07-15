import { z } from 'zod';
import { NodeSelectObjectSchema } from './objects/NodeSelect.schema';
import { NodeIncludeObjectSchema } from './objects/NodeInclude.schema';
import { NodeWhereUniqueInputObjectSchema } from './objects/NodeWhereUniqueInput.schema';

export const NodeDeleteOneSchema = z.object({
  select: NodeSelectObjectSchema.optional(),
  include: NodeIncludeObjectSchema.optional(),
  where: NodeWhereUniqueInputObjectSchema,
});
