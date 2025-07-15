import { z } from 'zod';
import { NodeSelectObjectSchema } from './objects/NodeSelect.schema';
import { NodeIncludeObjectSchema } from './objects/NodeInclude.schema';
import { NodeCreateInputObjectSchema } from './objects/NodeCreateInput.schema';
import { NodeUncheckedCreateInputObjectSchema } from './objects/NodeUncheckedCreateInput.schema';

export const NodeCreateOneSchema = z.object({
  select: NodeSelectObjectSchema.optional(),
  include: NodeIncludeObjectSchema.optional(),
  data: z.union([
    NodeCreateInputObjectSchema,
    NodeUncheckedCreateInputObjectSchema,
  ]),
});
