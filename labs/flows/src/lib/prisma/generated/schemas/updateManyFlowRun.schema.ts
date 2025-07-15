import { z } from 'zod';
import { FlowRunUpdateManyMutationInputObjectSchema } from './objects/FlowRunUpdateManyMutationInput.schema';
import { FlowRunWhereInputObjectSchema } from './objects/FlowRunWhereInput.schema';

export const FlowRunUpdateManySchema = z.object({
  data: FlowRunUpdateManyMutationInputObjectSchema,
  where: FlowRunWhereInputObjectSchema.optional(),
});
