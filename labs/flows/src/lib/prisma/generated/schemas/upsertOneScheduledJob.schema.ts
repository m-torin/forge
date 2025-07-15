import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './objects/ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './objects/ScheduledJobInclude.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './objects/ScheduledJobWhereUniqueInput.schema';
import { ScheduledJobCreateInputObjectSchema } from './objects/ScheduledJobCreateInput.schema';
import { ScheduledJobUncheckedCreateInputObjectSchema } from './objects/ScheduledJobUncheckedCreateInput.schema';
import { ScheduledJobUpdateInputObjectSchema } from './objects/ScheduledJobUpdateInput.schema';
import { ScheduledJobUncheckedUpdateInputObjectSchema } from './objects/ScheduledJobUncheckedUpdateInput.schema';

export const ScheduledJobUpsertSchema = z.object({
  select: ScheduledJobSelectObjectSchema.optional(),
  include: ScheduledJobIncludeObjectSchema.optional(),
  where: ScheduledJobWhereUniqueInputObjectSchema,
  create: z.union([
    ScheduledJobCreateInputObjectSchema,
    ScheduledJobUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    ScheduledJobUpdateInputObjectSchema,
    ScheduledJobUncheckedUpdateInputObjectSchema,
  ]),
});
