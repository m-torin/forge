import { z } from 'zod';
import { NodeUpdateManyMutationInputObjectSchema } from './objects/NodeUpdateManyMutationInput.schema';
import { NodeWhereInputObjectSchema } from './objects/NodeWhereInput.schema';

export const NodeUpdateManySchema = z.object({
  data: NodeUpdateManyMutationInputObjectSchema,
  where: NodeWhereInputObjectSchema.optional(),
});
