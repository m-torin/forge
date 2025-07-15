import { z } from 'zod';
import { ScheduledJobWhereInputObjectSchema } from './objects/ScheduledJobWhereInput.schema';

export const ScheduledJobDeleteManySchema = z.object({
  where: ScheduledJobWhereInputObjectSchema.optional(),
});
