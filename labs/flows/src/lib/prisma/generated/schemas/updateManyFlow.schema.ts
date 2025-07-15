import { z } from 'zod';
import { FlowUpdateManyMutationInputObjectSchema } from './objects/FlowUpdateManyMutationInput.schema';
import { FlowWhereInputObjectSchema } from './objects/FlowWhereInput.schema';

export const FlowUpdateManySchema = z.object({
  data: FlowUpdateManyMutationInputObjectSchema,
  where: FlowWhereInputObjectSchema.optional(),
});
