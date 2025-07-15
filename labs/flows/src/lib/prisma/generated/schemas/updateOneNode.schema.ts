import { z } from 'zod';
import { NodeSelectObjectSchema } from './objects/NodeSelect.schema';
import { NodeIncludeObjectSchema } from './objects/NodeInclude.schema';
import { NodeUpdateInputObjectSchema } from './objects/NodeUpdateInput.schema';
import { NodeUncheckedUpdateInputObjectSchema } from './objects/NodeUncheckedUpdateInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './objects/NodeWhereUniqueInput.schema';

export const NodeUpdateOneSchema = z.object({
  select: NodeSelectObjectSchema.optional(),
  include: NodeIncludeObjectSchema.optional(),
  data: z.union([
    NodeUpdateInputObjectSchema,
    NodeUncheckedUpdateInputObjectSchema,
  ]),
  where: NodeWhereUniqueInputObjectSchema,
});
