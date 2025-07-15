import { z } from 'zod';
import { FlowEventWhereInputObjectSchema } from './objects/FlowEventWhereInput.schema';

export const FlowEventDeleteManySchema = z.object({
  where: FlowEventWhereInputObjectSchema.optional(),
});
