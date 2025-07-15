import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './objects/ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './objects/ScheduledJobInclude.schema';
import { ScheduledJobCreateInputObjectSchema } from './objects/ScheduledJobCreateInput.schema';
import { ScheduledJobUncheckedCreateInputObjectSchema } from './objects/ScheduledJobUncheckedCreateInput.schema';

export const ScheduledJobCreateOneSchema = z.object({
  select: ScheduledJobSelectObjectSchema.optional(),
  include: ScheduledJobIncludeObjectSchema.optional(),
  data: z.union([
    ScheduledJobCreateInputObjectSchema,
    ScheduledJobUncheckedCreateInputObjectSchema,
  ]),
});
