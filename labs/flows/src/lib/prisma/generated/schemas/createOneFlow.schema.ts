import { z } from 'zod';
import { FlowSelectObjectSchema } from './objects/FlowSelect.schema';
import { FlowIncludeObjectSchema } from './objects/FlowInclude.schema';
import { FlowCreateInputObjectSchema } from './objects/FlowCreateInput.schema';
import { FlowUncheckedCreateInputObjectSchema } from './objects/FlowUncheckedCreateInput.schema';

export const FlowCreateOneSchema = z.object({
  select: FlowSelectObjectSchema.optional(),
  include: FlowIncludeObjectSchema.optional(),
  data: z.union([
    FlowCreateInputObjectSchema,
    FlowUncheckedCreateInputObjectSchema,
  ]),
});
