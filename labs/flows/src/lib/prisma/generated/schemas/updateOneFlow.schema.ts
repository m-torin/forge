import { z } from 'zod';
import { FlowSelectObjectSchema } from './objects/FlowSelect.schema';
import { FlowIncludeObjectSchema } from './objects/FlowInclude.schema';
import { FlowUpdateInputObjectSchema } from './objects/FlowUpdateInput.schema';
import { FlowUncheckedUpdateInputObjectSchema } from './objects/FlowUncheckedUpdateInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './objects/FlowWhereUniqueInput.schema';

export const FlowUpdateOneSchema = z.object({
  select: FlowSelectObjectSchema.optional(),
  include: FlowIncludeObjectSchema.optional(),
  data: z.union([
    FlowUpdateInputObjectSchema,
    FlowUncheckedUpdateInputObjectSchema,
  ]),
  where: FlowWhereUniqueInputObjectSchema,
});
