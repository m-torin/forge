import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './objects/ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './objects/ScheduledJobInclude.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './objects/ScheduledJobWhereUniqueInput.schema';

export const ScheduledJobDeleteOneSchema = z.object({
  select: ScheduledJobSelectObjectSchema.optional(),
  include: ScheduledJobIncludeObjectSchema.optional(),
  where: ScheduledJobWhereUniqueInputObjectSchema,
});
