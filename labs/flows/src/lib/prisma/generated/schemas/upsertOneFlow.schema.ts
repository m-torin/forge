import { z } from 'zod';
import { FlowSelectObjectSchema } from './objects/FlowSelect.schema';
import { FlowIncludeObjectSchema } from './objects/FlowInclude.schema';
import { FlowWhereUniqueInputObjectSchema } from './objects/FlowWhereUniqueInput.schema';
import { FlowCreateInputObjectSchema } from './objects/FlowCreateInput.schema';
import { FlowUncheckedCreateInputObjectSchema } from './objects/FlowUncheckedCreateInput.schema';
import { FlowUpdateInputObjectSchema } from './objects/FlowUpdateInput.schema';
import { FlowUncheckedUpdateInputObjectSchema } from './objects/FlowUncheckedUpdateInput.schema';

export const FlowUpsertSchema = z.object({
  select: FlowSelectObjectSchema.optional(),
  include: FlowIncludeObjectSchema.optional(),
  where: FlowWhereUniqueInputObjectSchema,
  create: z.union([
    FlowCreateInputObjectSchema,
    FlowUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    FlowUpdateInputObjectSchema,
    FlowUncheckedUpdateInputObjectSchema,
  ]),
});
