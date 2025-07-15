import { z } from 'zod';
import { NodeSelectObjectSchema } from './objects/NodeSelect.schema';
import { NodeIncludeObjectSchema } from './objects/NodeInclude.schema';
import { NodeWhereUniqueInputObjectSchema } from './objects/NodeWhereUniqueInput.schema';
import { NodeCreateInputObjectSchema } from './objects/NodeCreateInput.schema';
import { NodeUncheckedCreateInputObjectSchema } from './objects/NodeUncheckedCreateInput.schema';
import { NodeUpdateInputObjectSchema } from './objects/NodeUpdateInput.schema';
import { NodeUncheckedUpdateInputObjectSchema } from './objects/NodeUncheckedUpdateInput.schema';

export const NodeUpsertSchema = z.object({
  select: NodeSelectObjectSchema.optional(),
  include: NodeIncludeObjectSchema.optional(),
  where: NodeWhereUniqueInputObjectSchema,
  create: z.union([
    NodeCreateInputObjectSchema,
    NodeUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    NodeUpdateInputObjectSchema,
    NodeUncheckedUpdateInputObjectSchema,
  ]),
});
