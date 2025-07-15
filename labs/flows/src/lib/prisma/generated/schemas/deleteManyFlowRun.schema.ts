import { z } from 'zod';
import { FlowRunWhereInputObjectSchema } from './objects/FlowRunWhereInput.schema';

export const FlowRunDeleteManySchema = z.object({
  where: FlowRunWhereInputObjectSchema.optional(),
});
