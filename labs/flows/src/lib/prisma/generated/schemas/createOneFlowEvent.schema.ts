import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './objects/FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './objects/FlowEventInclude.schema';
import { FlowEventCreateInputObjectSchema } from './objects/FlowEventCreateInput.schema';
import { FlowEventUncheckedCreateInputObjectSchema } from './objects/FlowEventUncheckedCreateInput.schema';

export const FlowEventCreateOneSchema = z.object({
  select: FlowEventSelectObjectSchema.optional(),
  include: FlowEventIncludeObjectSchema.optional(),
  data: z.union([
    FlowEventCreateInputObjectSchema,
    FlowEventUncheckedCreateInputObjectSchema,
  ]),
});
