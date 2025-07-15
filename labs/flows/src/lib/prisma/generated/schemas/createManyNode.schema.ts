import { z } from 'zod';
import { NodeCreateManyInputObjectSchema } from './objects/NodeCreateManyInput.schema';

export const NodeCreateManySchema = z.object({
  data: z.union([
    NodeCreateManyInputObjectSchema,
    z.array(NodeCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
