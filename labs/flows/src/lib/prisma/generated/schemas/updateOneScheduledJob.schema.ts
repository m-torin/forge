import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './objects/ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './objects/ScheduledJobInclude.schema';
import { ScheduledJobUpdateInputObjectSchema } from './objects/ScheduledJobUpdateInput.schema';
import { ScheduledJobUncheckedUpdateInputObjectSchema } from './objects/ScheduledJobUncheckedUpdateInput.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './objects/ScheduledJobWhereUniqueInput.schema';

export const ScheduledJobUpdateOneSchema = z.object({
  select: ScheduledJobSelectObjectSchema.optional(),
  include: ScheduledJobIncludeObjectSchema.optional(),
  data: z.union([
    ScheduledJobUpdateInputObjectSchema,
    ScheduledJobUncheckedUpdateInputObjectSchema,
  ]),
  where: ScheduledJobWhereUniqueInputObjectSchema,
});
