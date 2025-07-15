import { z } from 'zod';
import { ScheduledJobUpdateManyMutationInputObjectSchema } from './objects/ScheduledJobUpdateManyMutationInput.schema';
import { ScheduledJobWhereInputObjectSchema } from './objects/ScheduledJobWhereInput.schema';

export const ScheduledJobUpdateManySchema = z.object({
  data: ScheduledJobUpdateManyMutationInputObjectSchema,
  where: ScheduledJobWhereInputObjectSchema.optional(),
});
