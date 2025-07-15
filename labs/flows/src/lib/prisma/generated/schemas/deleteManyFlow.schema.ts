import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './objects/FlowWhereInput.schema';

export const FlowDeleteManySchema = z.object({
  where: FlowWhereInputObjectSchema.optional(),
});
