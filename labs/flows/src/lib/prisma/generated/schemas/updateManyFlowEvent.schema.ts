import { z } from 'zod';
import { FlowEventUpdateManyMutationInputObjectSchema } from './objects/FlowEventUpdateManyMutationInput.schema';
import { FlowEventWhereInputObjectSchema } from './objects/FlowEventWhereInput.schema';

export const FlowEventUpdateManySchema = z.object({
  data: FlowEventUpdateManyMutationInputObjectSchema,
  where: FlowEventWhereInputObjectSchema.optional(),
});
