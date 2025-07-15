import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './objects/NodeWhereInput.schema';

export const NodeDeleteManySchema = z.object({
  where: NodeWhereInputObjectSchema.optional(),
});
